/**
 * Split into PT+YT (and merge back), for a selected maturity. The split leg
 * is entered in the underlying, never in SY — the same "spend in your own
 * asset, prepare any shortfall first" pattern as everywhere else, via
 * `useSyPreparation`. Merge still takes PT+YT directly (those names stay),
 * but its SY output previews as its underlying equivalent.
 */
import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { stroopsToXlm } from '../lib/amounts'
import { formatAmount, formatMaturity } from '../lib/format'
import { mergePtYt, splitSy, type AccountView } from '../lib/contracts/splitter'
import { wrapTokens } from '../lib/contracts/syVault'
import type { MaturityPosition } from '../hooks/usePortfolio'
import { isValidTokenAmount } from '../lib/validation'
import { chainNowMs } from '../lib/chainTime'
import { activeMarket } from '../lib/market'
import { requiredUnderlyingForSy } from '../lib/wrap'
import { RATE_SCALE } from '../lib/yield'
import { cardClasses } from '../lib/cardClasses'
import { useTxRunner } from '../hooks/useTxRunner'
import { useSyPreparation } from '../hooks/useSyPreparation'
import { SplitIcon } from './icons'
import { FIGURE_TONE, figureText } from '../lib/figures'
import { TxStatus } from './TxStatus'
import { AmountField, TabToggle, ActionButton } from './forms'
import { MaturitySelect, type MaturityOption } from './MaturitySelect'

interface SplitCardProps {
  address: string
  underlyingBalance: bigint
  syBalance: bigint
  positions: MaturityPosition[]
  liveRate: bigint | null
  loading: boolean
  isWrongNetwork: boolean
  onSuccess: () => void
}

type Tab = 'split' | 'merge'

const ZERO_POSITION: AccountView = { pt: 0n, yt: 0n, index: 0n, accruedSy: 0n, claimable: 0n }

function isMatured(maturity: bigint, nowMs: number): boolean {
  return Number(maturity) * 1000 <= nowMs
}

export function SplitCard({
  address,
  underlyingBalance,
  syBalance,
  positions,
  liveRate,
  loading,
  isWrongNetwork,
  onSuccess,
}: SplitCardProps): ReactElement {
  const market = activeMarket()
  const underlyingSymbol = market.underlyingSymbol
  const [tab, setTab] = useState<Tab>('split')
  const [amount, setAmount] = useState('')
  const [maturity, setMaturity] = useState<bigint | null>(null)
  const [nowMs, setNowMs] = useState(() => chainNowMs())
  const { outcome, pending, blocked, run, reset } = useTxRunner()
  const prepare = useTxRunner()
  const splitPrep = useSyPreparation(amount, underlyingBalance, syBalance, market, liveRate)

  useEffect(() => {
    const t = window.setInterval(() => {
      setNowMs(chainNowMs())
    }, 1000)
    return () => {
      window.clearInterval(t)
    }
  }, [])

  const options: MaturityOption[] = positions.map((p) => ({
    maturity: p.maturity,
    matured: isMatured(p.maturity, nowMs),
  }))
  // Prefer the user's pick if it still exists; else the first active maturity; else the first.
  const firstActive = options.find((o) => !o.matured)?.maturity
  const selected =
    maturity !== null && positions.some((p) => p.maturity === maturity)
      ? maturity
      : (firstActive ?? positions[0]?.maturity ?? null)
  const selectedMatured = selected !== null && isMatured(selected, nowMs)
  const position = positions.find((p) => p.maturity === selected)?.position ?? ZERO_POSITION

  // A merge burns PT *and* YT in equal parts, so the ceiling is whichever the
  // holder has less of. Validating against PT alone let anyone who had sold or
  // transferred their YT submit a merge that could only fail on chain
  // (SplitterError::InsufficientYt), paying the fee to find out.
  const mergeable = position.pt < position.yt ? position.pt : position.yt
  const mergeValid = isValidTokenAmount(amount, mergeable, { label: 'PT + YT' })
  const valid = tab === 'split' ? splitPrep.valid : mergeValid
  const balance = tab === 'split' ? splitPrep.maxSpendable : mergeable
  const needsPrepare = tab === 'split' && splitPrep.needsPrepare

  // Client-side floor preview of what the action produces: PT/YT from a split
  // (sy·rate/SCALE), or the merge's SY output converted back to its
  // underlying equivalent — merge isn't 1:1 as the rate grows, so the
  // estimate is genuinely useful before signing.
  const ptYtOut =
    !selectedMatured && liveRate !== null && tab === 'split' && splitPrep.syNeeded > 0n
      ? (splitPrep.syNeeded * liveRate) / RATE_SCALE
      : null
  const mergeSyOut =
    !selectedMatured && liveRate !== null && tab === 'merge' && mergeValid.ok
      ? (mergeValid.stroops * RATE_SCALE) / liveRate
      : null
  const mergeUnderlyingOut =
    mergeSyOut !== null ? requiredUnderlyingForSy(mergeSyOut, market, liveRate) : null

  function switchTab(id: Tab): void {
    setTab(id)
    setAmount('')
    reset()
    prepare.reset()
  }

  function submitPrepare(): void {
    if (!needsPrepare || prepare.pending || prepare.blocked || splitPrep.underlyingToWrap <= 0n)
      return
    void prepare.run(
      'Prepare',
      (onPhase) => wrapTokens(address, splitPrep.underlyingToWrap, onPhase),
      onSuccess,
      `${formatAmount(splitPrep.underlyingToWrap)} ${underlyingSymbol} · step 1 of 2`,
    )
  }

  function submit(): void {
    if (!valid.ok || needsPrepare || pending || blocked || selected === null || selectedMatured)
      return
    const label = tab === 'split' ? 'Split' : 'Merge'
    void run(
      label,
      (onPhase) =>
        tab === 'split'
          ? splitSy(address, selected, splitPrep.syNeeded, onPhase)
          : mergePtYt(address, selected, mergeValid.ok ? mergeValid.stroops : 0n, onPhase),
      () => {
        setAmount('')
        onSuccess()
      },
      tab === 'split'
        ? `${formatAmount(splitPrep.underlyingIn)} ${underlyingSymbol} · ${formatMaturity(selected)}`
        : `${formatAmount(mergeValid.ok ? mergeValid.stroops : 0n)} PT + YT · ${formatMaturity(selected)}`,
    )
  }

  return (
    <section className={cardClasses()}>
      <div className="flex items-center gap-2">
        <SplitIcon className={`h-4 w-4 ${figureText(FIGURE_TONE.split)}`} />
        <h2 className="text-sm font-medium text-neutral-100">Separate principal and yield</h2>
      </div>

      {positions.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-400">
          No maturities are available yet. The admin must create one before you can split.
        </p>
      ) : (
        <>
          <div className="mt-4">
            <MaturitySelect
              options={options}
              value={selected}
              onChange={(m) => {
                setMaturity(m)
                reset()
                prepare.reset()
              }}
            />
          </div>

          <TabToggle
            className="mt-4"
            label="Split or merge mode"
            options={[
              { id: 'split', label: 'Separate into PT + YT' },
              { id: 'merge', label: 'Recombine into your balance' },
            ]}
            active={tab}
            onChange={(id) => {
              switchTab(id as Tab)
            }}
          />

          <div className="mt-4">
            <AmountField
              id="split-amount"
              value={amount}
              onChange={(next) => {
                setAmount(next)
                prepare.reset()
              }}
              unit={tab === 'split' ? underlyingSymbol : 'PT'}
              hint={
                loading
                  ? 'Loading balances…'
                  : tab === 'split'
                    ? `Available: ${formatAmount(splitPrep.maxSpendable)} ${underlyingSymbol}`
                    : `Your PT: ${formatAmount(position.pt)} · YT: ${formatAmount(position.yt)}`
              }
              error={amount.trim() !== '' && !valid.ok ? valid.reason : null}
              onEnter={needsPrepare ? submitPrepare : submit}
              disabled={selectedMatured || blocked || prepare.blocked}
              onMax={
                !selectedMatured && !blocked && balance > 0n
                  ? () => {
                      setAmount(stroopsToXlm(balance))
                    }
                  : undefined
              }
            />
          </div>

          {((tab === 'split' && ptYtOut !== null) || (tab === 'merge' && mergeUnderlyingOut !== null)) && (
            <div className="mt-4 rounded-xl border border-hairline bg-neutral-950/40 p-4">
              <p className="text-sm font-semibold text-neutral-100">
                {tab === 'split' ? 'Review separation' : 'Review recombination'}
              </p>
              {tab === 'split' && needsPrepare && (
                <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                  This needs two wallet approvals: preparing your asset, then separating it.
                </p>
              )}
              <div className="mt-3 space-y-2 text-sm">
                <p className="flex items-center justify-between gap-4">
                  <span className="text-neutral-400">You use</span>
                  <span className="font-mono tabular-nums text-neutral-200">
                    {tab === 'split'
                      ? `${formatAmount(splitPrep.underlyingIn)} ${underlyingSymbol}`
                      : `${formatAmount(mergeValid.ok ? mergeValid.stroops : 0n)} PT + YT`}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-4">
                  <span className="text-neutral-400">You receive</span>
                  <span className="text-right font-mono font-medium tabular-nums text-neutral-100">
                    {tab === 'split'
                      ? `≈ ${formatAmount(ptYtOut ?? 0n)} PT + ${formatAmount(ptYtOut ?? 0n)} YT`
                      : `≈ ${formatAmount(mergeUnderlyingOut ?? 0n)} ${underlyingSymbol}`}
                  </span>
                </p>
              </div>
              <p className="mt-3 border-t border-hairline pt-3 text-xs leading-relaxed text-neutral-400">
                {tab === 'split'
                  ? 'This becomes matching principal and yield positions with the same maturity. Separating alone does not create extra value.'
                  : 'Matching PT and YT are burned together and returned to your prepared balance. Your wallet shows the final network fee before approval.'}
              </p>
            </div>
          )}

          {needsPrepare ? (
            <ActionButton
              className="mt-4"
              onClick={submitPrepare}
              disabled={isWrongNetwork || prepare.blocked || splitPrep.underlyingToWrap <= 0n}
              pending={prepare.pending}
              pendingLabel="Preparing…"
            >
              Prepare {formatAmount(splitPrep.underlyingToWrap)} {underlyingSymbol} — step 1 of 2
            </ActionButton>
          ) : (
            <ActionButton
              className="mt-4"
              onClick={submit}
              disabled={isWrongNetwork || selectedMatured || blocked || !valid.ok}
              pending={pending}
              pendingLabel={tab === 'split' ? 'Splitting…' : 'Merging…'}
            >
              {tab === 'split' ? 'Confirm separation' : 'Confirm recombination'}
            </ActionButton>
          )}

          {selectedMatured ? (
            <p className="mt-3 text-center text-xs text-warning-300">
              This maturity has passed — split and merge are closed. Claim or redeem it under “Your
              positions”.
            </p>
          ) : (
            isWrongNetwork && (
              <p className="mt-3 text-center text-xs text-warning-300">
                Switch your wallet to Testnet to continue.
              </p>
            )
          )}

          {prepare.outcome && (
            <div className="mt-5">
              <TxStatus outcome={prepare.outcome} onRetry={submitPrepare} />
            </div>
          )}
          {outcome && (
            <div className="mt-5">
              <TxStatus outcome={outcome} onRetry={submit} />
            </div>
          )}
        </>
      )}
    </section>
  )
}
