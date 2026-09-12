/**
 * Prepare the market's underlying for Everspan (and release it back), driving
 * the tx lifecycle. Internally this wraps into/unwraps out of SY, but that
 * name never reaches the screen — both directions are entered and shown in
 * the reader's own asset.
 *
 * The two vaults mint differently, which is why "release" asks for an amount
 * up to what the wallet's prepared balance is *worth* rather than a raw SY
 * figure: the mock vault is 1:1, the Blend-backed vault issues bTokens at the
 * live exchange rate, and `previewWrapOutput`/`requiredUnderlyingForSy` are
 * exact inverses of each other, so entering an underlying amount on either
 * tab always resolves to the right SY figure for the contract call.
 */
import { useState } from 'react'
import type { ReactElement } from 'react'
import { stroopsToXlm } from '../lib/amounts'
import { formatAmount } from '../lib/format'
import { activeMarket } from '../lib/market'
import { previewWrapOutput, requiredUnderlyingForSy } from '../lib/wrap'
import { unwrapTokens, wrapTokens } from '../lib/contracts/syVault'
import { isValidTokenAmount } from '../lib/validation'
import { cardClasses } from '../lib/cardClasses'
import { useTxRunner } from '../hooks/useTxRunner'
import { LayersIcon } from './icons'
import { FIGURE_TONE, figureText } from '../lib/figures'
import { TxStatus } from './TxStatus'
import { AmountField, TabToggle, ActionButton } from './forms'

interface WrapCardProps {
  address: string
  underlyingBalance: bigint
  syBalance: bigint
  /** Current SY exchange rate (scaled by 1e12), or null while unknown. */
  liveRate: bigint | null
  loading: boolean
  isWrongNetwork: boolean
  onSuccess: () => void
}

type Tab = 'wrap' | 'unwrap'

export function WrapCard({
  address,
  underlyingBalance,
  syBalance,
  liveRate,
  loading,
  isWrongNetwork,
  onSuccess,
}: WrapCardProps): ReactElement {
  const [tab, setTab] = useState<Tab>('wrap')
  const [amount, setAmount] = useState('')
  const { outcome, pending, blocked, run, reset } = useTxRunner()

  const market = activeMarket()
  const underlyingSymbol = market.underlyingSymbol
  // "Release" is entered in the same asset as "prepare" — the ceiling is what
  // the wallet's prepared balance is worth, not its raw SY figure.
  const preparedAsUnderlying = requiredUnderlyingForSy(syBalance, market, liveRate) ?? 0n
  const balance = tab === 'wrap' ? underlyingBalance : preparedAsUnderlying
  const valid = isValidTokenAmount(amount, balance, { label: underlyingSymbol })
  const underlyingAmount = valid.ok ? valid.stroops : 0n
  // The SY figure the contract call actually needs — `previewWrapOutput` and
  // `requiredUnderlyingForSy` are exact inverses, so flooring twice (once to
  // cap `balance` above, once here) never overshoots `syBalance`.
  const syAmount =
    underlyingAmount > 0n ? (previewWrapOutput(underlyingAmount, market, liveRate) ?? 0n) : 0n

  function submit(): void {
    if (!valid.ok || pending || blocked) return
    const label = tab === 'wrap' ? 'Wrap' : 'Unwrap'
    void run(
      label,
      (onPhase) =>
        tab === 'wrap'
          ? wrapTokens(address, underlyingAmount, onPhase)
          : unwrapTokens(address, syAmount, onPhase),
      () => {
        setAmount('')
        onSuccess()
      },
      `${formatAmount(underlyingAmount)} ${underlyingSymbol}`,
    )
  }

  return (
    <section className={cardClasses()}>
      <div className="flex items-center gap-2">
        <LayersIcon className={`h-4 w-4 ${figureText(FIGURE_TONE.markets)}`} />
        <h2 className="text-sm font-medium text-neutral-100">Prepare an asset</h2>
      </div>

      <TabToggle
        className="mt-4"
        label="Prepare or release mode"
        options={[
          { id: 'wrap', label: 'Prepare balance' },
          { id: 'unwrap', label: 'Release balance' },
        ]}
        active={tab}
        onChange={(id) => {
          setTab(id as Tab)
          setAmount('')
          reset()
        }}
      />

      <div className="mt-4">
        <AmountField
          id="wrap-amount"
          value={amount}
          onChange={setAmount}
          unit={underlyingSymbol}
          hint={
            loading
              ? 'Loading balances…'
              : `Available: ${formatAmount(balance)} ${underlyingSymbol}`
          }
          error={amount.trim() !== '' && !valid.ok ? valid.reason : null}
          onEnter={submit}
          disabled={blocked}
          onMax={
            balance > 0n && !blocked
              ? () => {
                  setAmount(stroopsToXlm(balance))
                }
              : undefined
          }
        />
      </div>

      {valid.ok && underlyingAmount > 0n && (
        <div className="mt-4 rounded-xl border border-hairline bg-neutral-950/40 p-4">
          <p className="text-sm font-semibold text-neutral-100">
            {tab === 'wrap' ? 'Review prepare' : 'Review release'}
          </p>
          <p className="mt-2 text-sm text-neutral-200">
            {tab === 'wrap'
              ? `Prepares ${formatAmount(underlyingAmount)} ${underlyingSymbol} for Everspan.`
              : `Releases ${formatAmount(underlyingAmount)} ${underlyingSymbol} back to your wallet.`}
          </p>
          <p className="mt-3 border-t border-hairline pt-3 text-xs leading-relaxed text-neutral-400">
            This does not create an additional return by itself — your balance is worth the same
            before and after. Your wallet shows the final network fee before approval.
          </p>
        </div>
      )}

      <ActionButton
        className="mt-4"
        onClick={submit}
        disabled={isWrongNetwork || blocked || !valid.ok}
        pending={pending}
        pendingLabel={tab === 'wrap' ? 'Preparing…' : 'Releasing…'}
      >
        {tab === 'wrap' ? 'Confirm prepare' : 'Confirm release'}
      </ActionButton>

      {isWrongNetwork && (
        <p className="mt-3 text-center text-xs text-warning-300">
          Switch your wallet to Testnet to continue.
        </p>
      )}

      {outcome && (
        <div className="mt-5">
          <TxStatus outcome={outcome} onRetry={submit} />
        </div>
      )}
    </section>
  )
}
