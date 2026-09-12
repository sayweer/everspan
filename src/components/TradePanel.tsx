/** Trade tab: lock a fixed rate (SY→PT) or go long yield (split, sell PT). */
import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import type { MaturityPool } from '../hooks/usePools'
import type { MaturityPosition } from '../hooks/usePortfolio'
import { useNow } from '../hooks/useNow'
import { useTxRunner } from '../hooks/useTxRunner'
import { useSyPreparation } from '../hooks/useSyPreparation'
import { stroopsToXlm } from '../lib/amounts'
import { activeMarket } from '../lib/market'
import { formatAmount, formatMaturity } from '../lib/format'
import { maturityCountdown, RATE_SCALE } from '../lib/yield'
import {
  clearLongYieldProgress,
  readLongYieldProgress,
  resolveLongYieldRecovery,
  saveLongYieldProgress,
} from '../lib/longYieldProgress'
import {
  effectiveApy,
  formatPercent,
  minOutFromSlippage,
  priceImpact,
  quoteSwap,
  type Reserves,
} from '../lib/amm'
import { wrapTokens } from '../lib/contracts/syVault'
import { splitSy } from '../lib/contracts/splitter'
import { swapExactIn } from '../lib/contracts/amm'
import { requiredUnderlyingForSy, requiredUnderlyingForSyAtLeast } from '../lib/wrap'
import { AmountField, ActionButton } from './forms'
import { MaturitySelect } from './MaturitySelect'
import { SlippageControl } from './SlippageControl'
import { SummaryRow } from './SummaryRow'
import { TxStatus } from './TxStatus'
import { AlertTriangleIcon, LockIcon } from './icons'
import { FIGURE_TONE, figureText } from '../lib/figures'

interface TradePanelProps {
  mode: 'lock' | 'long'
  address: string
  isWrongNetwork: boolean
  pools: MaturityPool[]
  positions: MaturityPosition[]
  loading: boolean
  underlyingBalance: bigint
  syBalance: bigint
  liveRate: bigint | null
  /** A maturity to preselect (e.g. clicked from Markets). */
  initialMaturity: bigint | null
  onMaturityChange: (maturity: bigint) => void
  onSuccess: () => void
}

export function TradePanel({
  mode,
  address,
  isWrongNetwork,
  pools,
  positions,
  loading,
  underlyingBalance,
  syBalance,
  liveRate,
  initialMaturity,
  onMaturityChange,
  onSuccess,
}: TradePanelProps): ReactElement {
  const now = useNow()

  // Only maturities with a funded, unexpired pool are tradeable.
  const tradeable = pools.filter(
    (p) =>
      p.pool !== null &&
      p.pool.ptReserve > 0n &&
      p.pool.syReserve > 0n &&
      Number(p.maturity) * 1000 > now,
  )
  // Only honour the incoming preselection while it is still tradeable: it is
  // captured on a click in Markets and outlives it, so a maturity that has since
  // expired or lost its liquidity would select a pool that isn't there — leaving
  // the panel with a dropdown showing a value it doesn't list and no form at all.
  const preselect =
    (initialMaturity !== null && tradeable.some((p) => p.maturity === initialMaturity)
      ? initialMaturity
      : tradeable[0]?.maturity) ?? null
  const selected = preselect
  const selectedPool = tradeable.find((p) => p.maturity === selected)?.pool ?? null
  const selectedPtBalance =
    positions.find((position) => position.maturity === selected)?.position.pt ?? 0n

  return (
    <div>
      <header>
        <h2 className="text-lg font-medium tracking-[-0.02em] text-neutral-100">
          {mode === 'lock' ? 'Lock a fixed return' : 'Increase yield exposure'}
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          {mode === 'lock'
            ? 'Buy principal at today’s price and redeem its maturity value later.'
            : 'Separate your asset, sell the principal side, and keep the variable yield side.'}
        </p>
      </header>

      {loading ? (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading active maturities"
          className="mt-5 space-y-3"
        >
          <div className="h-11 animate-pulse rounded-xl bg-neutral-850" />
          <div className="h-28 animate-pulse rounded-xl bg-neutral-850" />
        </div>
      ) : tradeable.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-400">
          No active maturity is available right now. Try again after a pool has been funded.
        </p>
      ) : (
        <>
          <div className="mt-4">
            <MaturitySelect
              options={tradeable.map((p) => ({ maturity: p.maturity, matured: false }))}
              value={selected}
              onChange={onMaturityChange}
            />
          </div>

          {selected !== null && selectedPool !== null && (
            <div className="mt-5">
              {mode === 'lock' ? (
                <LockRateForm
                  key={`lock-${selected.toString()}`}
                  address={address}
                  isWrongNetwork={isWrongNetwork}
                  maturity={selected}
                  pool={selectedPool}
                  underlyingBalance={underlyingBalance}
                  syBalance={syBalance}
                  liveRate={liveRate}
                  nowMs={now}
                  onSuccess={onSuccess}
                />
              ) : (
                <LongYieldForm
                  key={`long-${selected.toString()}`}
                  address={address}
                  isWrongNetwork={isWrongNetwork}
                  maturity={selected}
                  pool={selectedPool}
                  underlyingBalance={underlyingBalance}
                  syBalance={syBalance}
                  existingPtBalance={selectedPtBalance}
                  liveRate={liveRate}
                  onSuccess={onSuccess}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface LockFormProps {
  address: string
  isWrongNetwork: boolean
  maturity: bigint
  pool: Reserves
  underlyingBalance: bigint
  syBalance: bigint
  liveRate: bigint | null
  nowMs: number
  onSuccess: () => void
}

/**
 * Lock a fixed rate: swap SY → PT at a discount, redeem 1:1 at maturity.
 *
 * The reader spends in their own asset, never in SY — if the wallet doesn't
 * already hold enough, an explicit "Prepare" step wraps the shortfall first.
 * Once that confirms, `onSuccess` refreshes `syBalance` and the same button
 * turns into the lock itself; there is no second, hidden transaction.
 */
function LockRateForm({
  address,
  isWrongNetwork,
  maturity,
  pool,
  underlyingBalance,
  syBalance,
  liveRate,
  nowMs,
  onSuccess,
}: LockFormProps): ReactElement {
  const market = activeMarket()
  const underlyingSymbol = market.underlyingSymbol
  const [amount, setAmount] = useState('')
  const [slippageBps, setSlippageBps] = useState(50)
  const [acceptsLoss, setAcceptsLoss] = useState(false)
  const { outcome, pending, blocked, run, reset } = useTxRunner()
  const prepare = useTxRunner()

  // A new amount is a new trade — never carry an acknowledgement across it.
  function changeAmount(next: string): void {
    setAmount(next)
    setAcceptsLoss(false)
    reset()
    prepare.reset()
  }

  const { maxSpendable, valid, underlyingIn, syNeeded, underlyingToWrap, needsPrepare } =
    useSyPreparation(amount, underlyingBalance, syBalance, market, liveRate)

  const ptOut = syNeeded > 0n ? quoteSwap(pool, 'SyToPt', syNeeded) : 0n
  const minOut = minOutFromSlippage(ptOut, slippageBps)
  const dtSeconds = Number(maturity) - Math.floor(nowMs / 1000)
  const lockedApy =
    liveRate !== null && ptOut > 0n ? effectiveApy(syNeeded, ptOut, liveRate, dtSeconds) : null
  const impact = syNeeded > 0n ? priceImpact(pool.syReserve, pool.ptReserve, syNeeded) : 0
  const countdown = maturityCountdown(maturity, nowMs)
  // Paying above par for PT locks in a loss: PT only ever redeems its
  // principal, so a negative rate here is the trade's actual outcome, not a
  // display artefact. Shallow pools and near maturities make it easy to reach
  // with a modest order, so it has to be acknowledged rather than just shown.
  const locksLoss = lockedApy !== null && lockedApy < 0

  function submitPrepare(): void {
    if (!needsPrepare || prepare.pending || prepare.blocked || underlyingToWrap <= 0n) return
    void prepare.run(
      'Prepare',
      (onPhase) => wrapTokens(address, underlyingToWrap, onPhase),
      onSuccess,
      `${formatAmount(underlyingToWrap)} ${underlyingSymbol} · step 1 of 2`,
    )
  }

  function submit(): void {
    if (!valid.ok || needsPrepare || pending || blocked || ptOut <= 0n || (locksLoss && !acceptsLoss))
      return
    void run(
      'Lock rate',
      (onPhase) => swapExactIn(address, maturity, 'SyToPt', syNeeded, minOut, onPhase),
      () => {
        setAmount('')
        onSuccess()
      },
      `${formatAmount(underlyingIn)} ${underlyingSymbol} → at least ${formatAmount(minOut)} Principal · ${formatMaturity(maturity)}`,
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-hairline bg-neutral-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <LockIcon className={`h-4 w-4 ${figureText(FIGURE_TONE.fixed)}`} />
          <span className="text-sm font-medium text-neutral-100">
            {lockedApy === null ? 'Lock a fixed rate' : `Lock ${formatPercent(lockedApy)} APY`}
          </span>
        </div>
        <p className="mt-1 text-xs text-neutral-400">
          until {formatMaturity(maturity)} · {countdown.days}d {countdown.hours}h left
        </p>
      </div>

      <AmountField
        id="lock-amount"
        value={amount}
        onChange={changeAmount}
        unit={underlyingSymbol}
        hint={`Available: ${formatAmount(maxSpendable)} ${underlyingSymbol}`}
        error={amount.trim() !== '' && !valid.ok ? valid.reason : null}
        onEnter={needsPrepare ? submitPrepare : submit}
        disabled={blocked || prepare.blocked}
        onMax={
          maxSpendable > 0n && !blocked
            ? () => {
                changeAmount(stroopsToXlm(maxSpendable))
              }
            : undefined
        }
      />

      {ptOut > 0n && (
        <div className="rounded-xl border border-hairline bg-neutral-950/40 p-4">
          <p className="text-sm font-semibold text-neutral-100">Review fixed return</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            {needsPrepare
              ? 'This needs two wallet approvals: preparing your asset, then locking the rate.'
              : 'Check the outcome below before your wallet opens.'}
          </p>
          <div className="mt-4 space-y-2.5">
            <SummaryRow label="You pay">
              {formatAmount(underlyingIn)} {underlyingSymbol}
            </SummaryRow>
            <SummaryRow label="You receive at least" accent>
              {formatAmount(minOut)} Principal
            </SummaryRow>
            <SummaryRow label="Fixed APY">{formatPercent(lockedApy)}</SummaryRow>
            <SummaryRow label="Maturity">{formatMaturity(maturity)}</SummaryRow>
          </div>
          <p className="mt-4 border-t border-hairline pt-3 text-xs leading-relaxed text-neutral-400">
            Hold the principal until maturity for its displayed redemption outcome. Selling earlier
            may return less.
          </p>
          <details className="mt-3 border-t border-hairline pt-3 text-xs">
            <summary className="flex min-h-11 cursor-pointer items-center rounded py-2 font-medium text-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300">
              Price and slippage details
            </summary>
            <div className="mt-2 space-y-2.5 pb-1">
              <SummaryRow label="Quoted principal">{formatAmount(ptOut)}</SummaryRow>
              <SummaryRow label="Price impact">{formatPercent(impact)}</SummaryRow>
              <SummaryRow label="Maximum slippage">{(slippageBps / 100).toFixed(2)}%</SummaryRow>
              <SlippageControl bps={slippageBps} onChange={setSlippageBps} />
              <p className="text-neutral-500">
                Your wallet shows the final Stellar network fee before approval.
              </p>
            </div>
          </details>
        </div>
      )}

      {locksLoss && (
        <div
          role="alert"
          className="rounded-xl border border-warning-500/30 bg-warning-500/10 p-3.5 text-warning-100"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium">This trade locks in a loss</p>
              <p className="text-xs leading-relaxed text-warning-100/80">
                You would pay more for {formatAmount(ptOut)} Principal than it redeems for at
                maturity — a fixed rate of {formatPercent(lockedApy)}. The 0.30% swap fee and this
                order&apos;s price impact together outweigh the yield left until{' '}
                {formatMaturity(maturity)}. A later maturity, or a deeper pool, prices better.
              </p>
            </div>
          </div>
          <label className="mt-3 flex min-h-11 items-center gap-2.5 text-xs font-medium">
            <input
              type="checkbox"
              checked={acceptsLoss}
              onChange={(e) => {
                setAcceptsLoss(e.target.checked)
              }}
              className="h-6 w-6 shrink-0 rounded border-warning-300 bg-transparent accent-warning-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning-300"
            />
            I understand this locks a negative rate
          </label>
        </div>
      )}

      {needsPrepare ? (
        <ActionButton
          onClick={submitPrepare}
          disabled={isWrongNetwork || prepare.blocked || underlyingToWrap <= 0n}
          pending={prepare.pending}
          pendingLabel="Preparing…"
        >
          Prepare {formatAmount(underlyingToWrap)} {underlyingSymbol} — step 1 of 2
        </ActionButton>
      ) : (
        <ActionButton
          onClick={submit}
          disabled={
            isWrongNetwork || blocked || !valid.ok || ptOut <= 0n || (locksLoss && !acceptsLoss)
          }
          pending={pending}
          pendingLabel="Locking rate…"
        >
          Confirm fixed return in wallet
        </ActionButton>
      )}

      <p className="text-center text-[11px] text-neutral-500">
        The principal redeems in full at maturity — the discount you buy at is your fixed return.
      </p>

      {isWrongNetwork && (
        <p className="text-center text-xs text-warning-300">
          Switch your wallet to Testnet to continue.
        </p>
      )}
      {prepare.outcome && (
        <div>
          <button type="button" onClick={prepare.reset} className="sr-only">
            Dismiss status
          </button>
          <TxStatus outcome={prepare.outcome} onRetry={submitPrepare} />
        </div>
      )}
      {outcome && (
        <div>
          <button type="button" onClick={reset} className="sr-only">
            Dismiss status
          </button>
          <TxStatus outcome={outcome} onRetry={submit} />
        </div>
      )}
    </div>
  )
}

interface LongFormProps {
  address: string
  isWrongNetwork: boolean
  maturity: bigint
  pool: Reserves
  underlyingBalance: bigint
  syBalance: bigint
  existingPtBalance: bigint
  liveRate: bigint | null
  onSuccess: () => void
}

/**
 * Long yield: separate principal and yield, then sell the principal back to
 * the pool — you keep the yield for pure, leveraged exposure. Spent in the
 * reader's own asset, never in SY; when the wallet doesn't already hold
 * enough, an explicit "Prepare" stage wraps the shortfall ahead of the
 * existing split→sell dance, which is otherwise unchanged.
 */
function LongYieldForm({
  address,
  isWrongNetwork,
  maturity,
  pool,
  underlyingBalance,
  syBalance,
  existingPtBalance,
  liveRate,
  onSuccess,
}: LongFormProps): ReactElement {
  const market = activeMarket()
  const underlyingSymbol = market.underlyingSymbol
  const marketKey = market.key
  const [savedProgress, setSavedProgress] = useState(() =>
    readLongYieldProgress(address, marketKey, maturity),
  )
  const recovery = resolveLongYieldRecovery(savedProgress, existingPtBalance)
  const canResumeSaved = recovery.kind === 'resume_saved'
  const [amount, setAmount] = useState(() =>
    recovery.kind === 'resume_saved' && recovery.syIn > 0n ? stroopsToXlm(recovery.syIn) : '',
  )
  const [slippageBps, setSlippageBps] = useState(50)
  /** PT minted by the split, awaiting sale (null until the split confirms). */
  const [ptToSell, setPtToSell] = useState<bigint | null>(null)
  const [allowNewSplit, setAllowNewSplit] = useState(existingPtBalance === 0n && !canResumeSaved)
  const [progressStorageWarning, setProgressStorageWarning] = useState(false)
  const prepare = useTxRunner()
  const split = useTxRunner()
  const sell = useTxRunner()

  // Split target (floor(underlying→SY)·rate/SCALE, same as the split preview
  // ever was); PT == YT.
  const { maxSpendable, valid, underlyingIn, syNeeded: syIn } = useSyPreparation(
    amount,
    underlyingBalance,
    syBalance,
    market,
    liveRate,
  )
  const projected = liveRate !== null && syIn > 0n ? (syIn * liveRate) / RATE_SCALE : 0n
  const sellBack = projected > 0n ? quoteSwap(pool, 'PtToSy', projected) : 0n
  const sellBackUnderlying = requiredUnderlyingForSy(sellBack, market, liveRate) ?? 0n
  const netCost = underlyingIn > sellBackUnderlying ? underlyingIn - sellBackUnderlying : 0n
  const step2 = ptToSell !== null
  const step2Quote = step2 && ptToSell > 0n ? quoteSwap(pool, 'PtToSy', ptToSell) : 0n
  const step2MinOut = minOutFromSlippage(step2Quote, slippageBps)
  const step2MinOutUnderlying = requiredUnderlyingForSy(step2MinOut, market, liveRate) ?? 0n
  const needsRecoveryChoice = !step2 && existingPtBalance > 0n && !allowNewSplit
  // How much more SY the split needs than the wallet already holds.
  const syShort = !step2 && syIn > syBalance ? syIn - syBalance : 0n
  const underlyingToWrap =
    syShort > 0n ? (requiredUnderlyingForSyAtLeast(syShort, market, liveRate) ?? 0n) : 0n
  const needsPrepare = syShort > 0n

  // A completed late sale can leave a continuation behind. Once verified
  // holdings show no PT, discard it so it can never target future PT.
  useEffect(() => {
    if (!savedProgress || existingPtBalance > 0n) return
    clearLongYieldProgress(address, marketKey, maturity)
    // Intentional external-storage reconciliation: prevent this mounted form
    // from reusing the record if balances later refresh in the background.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedProgress(null)
  }, [address, existingPtBalance, marketKey, maturity, savedProgress])

  function doPrepare(): void {
    if (!needsPrepare || prepare.pending || prepare.blocked || underlyingToWrap <= 0n) return
    void prepare.run(
      'Prepare',
      (onPhase) => wrapTokens(address, underlyingToWrap, onPhase),
      onSuccess,
      `${formatAmount(underlyingToWrap)} ${underlyingSymbol}`,
    )
  }

  function doSplit(): void {
    if (!allowNewSplit || needsPrepare || !valid.ok || split.pending || split.blocked || projected <= 0n)
      return
    let captured: bigint | null = null
    void split.run(
      'Split',
      (onPhase) =>
        splitSy(address, maturity, syIn, onPhase).then((r) => {
          if ('ptOut' in r) captured = r.ptOut
          return r
        }),
      () => {
        if (captured === null || captured <= 0n) return
        const saved = saveLongYieldProgress({
          address,
          marketKey,
          maturity,
          ptOut: captured,
          syIn,
          source: 'split',
        })
        setProgressStorageWarning(!saved)
        setPtToSell(captured)
        onSuccess()
      },
      `${formatAmount(underlyingIn)} ${underlyingSymbol} · ${formatMaturity(maturity)}`,
    )
  }

  function doSell(): void {
    if (ptToSell === null || ptToSell <= 0n || step2Quote <= 0n || sell.pending || sell.blocked)
      return
    const minOut = minOutFromSlippage(quoteSwap(pool, 'PtToSy', ptToSell), slippageBps)
    void sell.run(
      'Sell principal',
      (onPhase) => swapExactIn(address, maturity, 'PtToSy', ptToSell, minOut, onPhase),
      () => {
        clearLongYieldProgress(address, marketKey, maturity)
        setAmount('')
        setPtToSell(null)
        setAllowNewSplit(existingPtBalance === ptToSell)
        onSuccess()
      },
      `${formatAmount(ptToSell)} principal · ${formatMaturity(maturity)}`,
    )
  }

  function continueWithExistingPt(): void {
    if (existingPtBalance <= 0n) return
    const saved = saveLongYieldProgress({
      address,
      marketKey,
      maturity,
      ptOut: existingPtBalance,
      syIn: 0n,
      source: 'existing',
    })
    setProgressStorageWarning(!saved)
    setPtToSell(existingPtBalance)
  }

  function continueWithSavedPt(): void {
    if (recovery.kind !== 'resume_saved') return
    setPtToSell(recovery.ptOut)
  }

  function startNewSplit(): void {
    clearLongYieldProgress(address, marketKey, maturity)
    setPtToSell(null)
    setAmount('')
    setAllowNewSplit(true)
    setProgressStorageWarning(false)
    split.reset()
    sell.reset()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-400">
        This separates your asset into principal and yield, then sells the principal — you keep the{' '}
        <span className="text-neutral-200">yield</span> for pure exposure.
      </p>

      {needsRecoveryChoice ? (
        <div role="status" className="rounded-xl border border-warning-300 bg-warning-500/10 p-4">
          <p className="text-sm font-semibold text-warning-100">Existing principal needs a choice</p>
          <p className="mt-1 text-xs leading-relaxed text-warning-200/80">
            This wallet already holds {formatAmount(existingPtBalance)} in principal for{' '}
            {formatMaturity(maturity)}. It may be a fixed-return holding or the first half of an
            interrupted yield strategy. Everspan will not split or sell until you choose.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {canResumeSaved && recovery.kind === 'resume_saved' ? (
              <ActionButton variant="secondary" onClick={continueWithSavedPt}>
                Resume saved step — sell {formatAmount(recovery.ptOut)} principal
              </ActionButton>
            ) : (
              <ActionButton variant="secondary" onClick={continueWithExistingPt}>
                Use all {formatAmount(existingPtBalance)} principal to continue
              </ActionButton>
            )}
            <ActionButton variant="secondary" onClick={startNewSplit}>
              Keep it and start a new split
            </ActionButton>
          </div>
        </div>
      ) : null}

      {step2 ? (
        <div role="status" className="rounded-xl border border-positive-300 bg-positive-500/10 p-4">
          <p className="text-sm font-semibold text-positive-100">Split is already complete</p>
          <p className="mt-1 text-xs leading-relaxed text-positive-200/80">
            Continue by selling exactly {formatAmount(ptToSell)} in principal. Everspan will not
            create another split for this flow.
          </p>
        </div>
      ) : null}

      <AmountField
        id="long-amount"
        value={amount}
        onChange={(v) => {
          setAmount(v)
          setPtToSell(null)
          prepare.reset()
          sell.reset()
        }}
        unit={underlyingSymbol}
        hint={`Available: ${formatAmount(maxSpendable)} ${underlyingSymbol}`}
        error={amount.trim() !== '' && !valid.ok ? valid.reason : null}
        disabled={step2 || needsRecoveryChoice || split.blocked || sell.blocked}
        onMax={
          maxSpendable > 0n && !step2 && !needsRecoveryChoice
            ? () => {
                setAmount(stroopsToXlm(maxSpendable))
              }
            : undefined
        }
      />

      {!step2 && projected > 0n && (
        <div className="rounded-xl border border-hairline bg-neutral-950/40 p-4">
          <p className="text-sm font-semibold text-neutral-100">Review yield exposure</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            {needsPrepare
              ? 'This strategy needs three wallet approvals: preparing your asset, then splitting, then selling. Progress stays visible below.'
              : 'This strategy needs two wallet approvals. The progress stays visible below.'}
          </p>
          <div className="mt-4 space-y-2.5">
            <SummaryRow label="You use">
              {formatAmount(underlyingIn)} {underlyingSymbol}
            </SummaryRow>
            <SummaryRow label="Yield you keep" accent>
              {formatAmount(projected)}
            </SummaryRow>
            <SummaryRow label="Principal sold for">
              ≈ {formatAmount(sellBackUnderlying)} {underlyingSymbol}
            </SummaryRow>
            <SummaryRow label="Estimated net cost">
              ≈ {formatAmount(netCost)} {underlyingSymbol}
            </SummaryRow>
          </div>
          <p className="mt-4 border-t border-hairline pt-3 text-xs leading-relaxed text-neutral-400">
            The yield you keep is realized until maturity. Its remaining opportunity falls as
            maturity approaches, and returns depend on the yield actually earned.
          </p>
          <details className="mt-3 border-t border-hairline pt-3 text-xs">
            <summary className="flex min-h-11 cursor-pointer items-center rounded py-2 font-medium text-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300">
              Slippage and fee details
            </summary>
            <div className="mt-2 space-y-2.5 pb-1">
              <SummaryRow label="Maximum slippage">{(slippageBps / 100).toFixed(2)}%</SummaryRow>
              <SlippageControl bps={slippageBps} onChange={setSlippageBps} />
              <p className="text-neutral-500">
                Your wallet shows the final Stellar network fee before each approval.
              </p>
            </div>
          </details>
        </div>
      )}

      {step2 && step2Quote > 0n ? (
        <div className="rounded-xl border border-hairline bg-neutral-950/40 p-4">
          <p className="text-sm font-semibold text-neutral-100">Review remaining transaction</p>
          <div className="mt-4 space-y-2.5">
            <SummaryRow label="Principal sold">{formatAmount(ptToSell)}</SummaryRow>
            <SummaryRow label="You receive at least" accent>
              {formatAmount(step2MinOutUnderlying)} {underlyingSymbol}
            </SummaryRow>
            <SummaryRow label="Maximum slippage">{(slippageBps / 100).toFixed(2)}%</SummaryRow>
          </div>
          <div className="mt-3 border-t border-hairline pt-3">
            <SlippageControl bps={slippageBps} onChange={setSlippageBps} />
          </div>
        </div>
      ) : null}

      {step2 && step2Quote <= 0n ? (
        <p role="alert" className="text-xs leading-relaxed text-warning-300">
          The pool cannot quote this amount of principal right now. Keep the saved step and try
          again after liquidity is available.
        </p>
      ) : null}

      {progressStorageWarning ? (
        <p role="alert" className="text-xs leading-relaxed text-warning-300">
          Keep this page open until the sale finishes. Everspan could not save this continuation for
          a reload; existing principal detection will still prevent an automatic duplicate split.
        </p>
      ) : null}

      {/* Stage indicators */}
      <ol className="flex items-center gap-2 text-xs">
        {needsPrepare && (
          <>
            <StageChip n={1} label="Prepare" done={false} active />
            <span className="h-px flex-1 bg-raised" />
          </>
        )}
        <StageChip n={needsPrepare ? 2 : 1} label="Split" done={step2} active={!step2 && !needsPrepare} />
        <span className="h-px flex-1 bg-raised" />
        <StageChip n={needsPrepare ? 3 : 2} label="Sell" done={false} active={step2} />
      </ol>

      {needsPrepare ? (
        <ActionButton
          onClick={doPrepare}
          disabled={isWrongNetwork || prepare.blocked || underlyingToWrap <= 0n}
          pending={prepare.pending}
          pendingLabel="Preparing…"
        >
          Prepare {formatAmount(underlyingToWrap)} {underlyingSymbol}
        </ActionButton>
      ) : !step2 ? (
        <ActionButton
          onClick={doSplit}
          disabled={
            isWrongNetwork ||
            !allowNewSplit ||
            needsRecoveryChoice ||
            split.blocked ||
            !valid.ok ||
            projected <= 0n
          }
          pending={split.pending}
          pendingLabel="Splitting…"
        >
          Separate principal and yield
        </ActionButton>
      ) : (
        <ActionButton
          onClick={doSell}
          disabled={
            isWrongNetwork ||
            sell.blocked ||
            ptToSell === null ||
            ptToSell <= 0n ||
            step2Quote <= 0n
          }
          pending={sell.pending}
          pendingLabel="Selling…"
        >
          Sell {formatAmount(ptToSell ?? 0n)} principal
        </ActionButton>
      )}

      {isWrongNetwork && (
        <p className="text-center text-xs text-warning-300">
          Switch your wallet to Testnet to continue.
        </p>
      )}
      {prepare.outcome && <TxStatus outcome={prepare.outcome} onRetry={doPrepare} />}
      {split.outcome && <TxStatus outcome={split.outcome} onRetry={doSplit} />}
      {sell.outcome && <TxStatus outcome={sell.outcome} onRetry={doSell} />}
    </div>
  )
}

function StageChip({
  n,
  label,
  done,
  active,
}: {
  n: number
  label: string
  done: boolean
  active: boolean
}): ReactElement {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${
        done
          ? 'bg-accent-500/15 text-accent-300'
          : active
            ? 'bg-raised text-neutral-100'
            : 'text-neutral-500'
      }`}
    >
      <span
        className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${
          done
            ? 'bg-accent-500 text-onAccent'
            : active
              ? 'bg-raised text-neutral-100'
              : 'bg-raised text-neutral-500'
        }`}
      >
        {done ? '✓' : n}
      </span>
      {label}
    </span>
  )
}
