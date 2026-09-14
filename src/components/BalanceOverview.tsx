/**
 * What the account is worth: one unframed total, and a plain list of what
 * makes it up — no per-item cards, the way a banking app lists holdings under
 * its balance rather than boxing each one. Folds together what used to be
 * three separate framed sections (BalanceCard, BalanceHero, WalletBar): the
 * XLM reserve that pays network fees is one row here, and the market's
 * underlying balance is not shown a second time — it is already counted in
 * "Liquid" below, so repeating it would be the same figure twice.
 */
import { useState } from 'react'
import type { ReactElement } from 'react'
import type { Holdings } from '../lib/holdings'
import { formatAmount } from '../lib/format'
import { activeMarket } from '../lib/market'
import { requestFaucet } from '../lib/contracts/underlying'
import { fundTestnetAccount } from '../lib/friendbot'
import { isAppError, type AppError } from '../types'
import { useToast } from '../hooks/useToast'
import { useTransactionSafety } from '../context/TransactionSafetyContext'
import { useTxRunner } from '../hooks/useTxRunner'
import { AMOUNT_MASK as MASK } from '../hooks/useHiddenAmounts'
import { focusRing } from '../lib/buttonStyles'
import { underlyingMark } from '../lib/tokenMarks'
import { Button, IconButton } from './Button'
import { FaucetButton, FAUCET_AMOUNT } from './FaucetButton'
import { TxStatus } from './TxStatus'
import { TokenIcon } from './TokenIcon'
import { ChevronDownIcon, EyeIcon, EyeOffIcon, RefreshIcon } from './icons'

interface BalanceOverviewProps {
  address: string
  holdings: Holdings
  symbol: string
  loading: boolean
  hidden: boolean
  onToggleHidden: () => void
  onRefresh: () => void
  xlmBalance: string | null
  xlmFunded: boolean
  xlmLoading: boolean
  xlmError: AppError | null
  isWrongNetwork: boolean
  onConvert: () => void
  onPortfolio: () => void
  onLiquidity: () => void
}

/** Group the integer part and keep up to 7 decimals (min 2), without float rounding. */
function formatXlm(raw: string): string {
  const [intPart = '0', fracRaw = ''] = raw.split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  let frac = fracRaw.replace(/0+$/, '')
  if (frac.length < 2) frac = frac.padEnd(2, '0')
  return `${grouped}.${frac}`
}

/** Split "1,234.5678" into its whole and fractional halves. */
function splitAmount(formatted: string): { whole: string; fraction: string } {
  const dot = formatted.indexOf('.')
  if (dot === -1) return { whole: formatted, fraction: '' }
  return { whole: formatted.slice(0, dot), fraction: formatted.slice(dot + 1) }
}

export function BalanceOverview({
  address,
  holdings,
  symbol,
  loading,
  hidden,
  onToggleHidden,
  onRefresh,
  xlmBalance,
  xlmFunded,
  xlmLoading,
  xlmError,
  isWrongNetwork,
  onConvert,
  onPortfolio,
  onLiquidity,
}: BalanceOverviewProps): ReactElement {
  const { notify } = useToast()
  const { online, trackedTransaction } = useTransactionSafety()
  const [funding, setFunding] = useState(false)
  const fundingBlocked = !online || trackedTransaction !== null
  const faucet = useTxRunner()
  const market = activeMarket()

  async function handleFund(): Promise<void> {
    if (funding || fundingBlocked) return
    setFunding(true)
    const result = await fundTestnetAccount(address)
    setFunding(false)
    if (isAppError(result)) {
      notify(result.code === 'already_funded' ? 'info' : 'error', result.message)
      if (result.code === 'already_funded') onRefresh()
      return
    }
    notify('success', 'Account funded with 10,000 test XLM.')
    onRefresh()
  }

  function runFaucet(): void {
    if (faucet.blocked) return
    void faucet.run(
      'Faucet',
      (onPhase) => requestFaucet(address, FAUCET_AMOUNT, onPhase),
      onRefresh,
      `${formatAmount(FAUCET_AMOUNT)} ${market.underlyingSymbol}`,
    )
  }

  const parts = splitAmount(formatAmount(holdings.total, 4))

  const segments = [
    {
      label: 'Liquid',
      hint: `${symbol} you can act with now`,
      value: holdings.liquid,
      icon: <TokenIcon mark={underlyingMark(market.underlyingSymbol)} />,
      onSelect: onConvert,
    },
    {
      label: 'Principal',
      hint: 'Principal held, marked at the pool',
      value: holdings.principal,
      icon: <TokenIcon mark="principal" />,
      onSelect: onPortfolio,
    },
    {
      label: 'Liquidity',
      hint: 'Your share of the pools',
      value: holdings.liquidity,
      icon: <TokenIcon mark="liquidity" />,
      onSelect: onLiquidity,
    },
    {
      label: 'Claimable',
      hint: 'Yield accrued and waiting',
      value: holdings.claimable,
      icon: <TokenIcon mark="yield" />,
      onSelect: onPortfolio,
    },
  ].filter((segment) => segment.value > 0n)

  return (
    <section aria-label="Balance overview" className="pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
            Total value
          </span>
          <div
            className={`mt-1 flex min-w-0 items-baseline font-figure tabular-nums text-neutral-50 ${
              loading ? 'opacity-60' : ''
            }`}
          >
            <span className="truncate text-[clamp(2.25rem,9vw,3.25rem)] font-bold leading-none tracking-[-0.02em]">
              {hidden ? MASK : parts.whole}
            </span>
            {/* The fraction and unit ride on the whole number's baseline as one
                quieter run, so the eye lands on the whole figure first. */}
            <span className="shrink-0 whitespace-pre text-base font-medium leading-none text-neutral-400">
              {!hidden && parts.fraction ? `.${parts.fraction} ` : ' '}
              {symbol}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            label={hidden ? 'Show amounts' : 'Hide amounts'}
            aria-pressed={hidden}
            icon={hidden ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
            onClick={onToggleHidden}
          />
          <IconButton
            label="Refresh balances"
            icon={<RefreshIcon className="h-4 w-4" />}
            onClick={onRefresh}
            pending={loading}
          />
        </div>
      </div>

      <ul className="mt-5 divide-y divide-hairline border-y border-hairline">
        {/* The network's own reserve — distinct from "Liquid" below, which is
            what the market's underlying asset already counts. */}
        <li>
          <div className="flex w-full items-center gap-3 py-3">
            <TokenIcon mark="xlm" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-neutral-100">XLM</span>
              <span className="mt-0.5 block truncate text-xs text-neutral-500">
                {xlmError
                  ? xlmError.message
                  : xlmFunded
                    ? 'For network fees'
                    : 'Not funded yet'}
              </span>
            </span>
            {xlmLoading ? (
              <span role="status" aria-live="polite" aria-label="Loading XLM balance">
                <span
                  aria-hidden="true"
                  className="block h-4 w-20 shrink-0 animate-pulse rounded-full bg-raised"
                />
              </span>
            ) : xlmError ? (
              <Button variant="secondary" size="sm" onClick={onRefresh}>
                Try again
              </Button>
            ) : xlmFunded ? (
              <span className="shrink-0 tabular-nums text-sm text-neutral-200">
                {hidden ? MASK : xlmBalance ? formatXlm(xlmBalance) : '0.00'}
              </span>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void handleFund()
                }}
                disabled={fundingBlocked}
                pending={funding}
                pendingLabel="Funding…"
              >
                Fund with Friendbot
              </Button>
            )}
          </div>
          {!xlmLoading && !xlmError && !xlmFunded && fundingBlocked && (
            <p className="pb-3 text-xs text-neutral-400">
              {online
                ? 'Funding is paused until the current transaction is resolved.'
                : 'Reconnect to the internet before funding this account.'}
            </p>
          )}
        </li>

        {segments.map((segment) => (
          <li key={segment.label}>
            <button
              type="button"
              onClick={segment.onSelect}
              className={`flex w-full items-center gap-3 py-3 text-left transition-colors duration-100 hover:bg-raised ${focusRing}`}
            >
              {segment.icon}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-neutral-100">
                  {segment.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-neutral-500">
                  {segment.hint}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-sm text-neutral-200">
                {hidden ? MASK : formatAmount(segment.value, 2)}
              </span>
              <ChevronDownIcon
                aria-hidden="true"
                className="h-4 w-4 shrink-0 -rotate-90 text-neutral-600"
              />
            </button>
          </li>
        ))}
      </ul>

      {holdings.yt > 0n && !hidden && (
        <p className="mt-3 text-xs leading-relaxed text-neutral-500">
          Plus {formatAmount(holdings.yt, 2)} in yield exposure. It is not counted above — nothing
          in the protocol prices the yield still to come.
        </p>
      )}

      {holdings.unmarked.length > 0 && (
        <p className="mt-2 text-xs leading-relaxed text-warning-300">
          {holdings.unmarked.length === 1
            ? 'One maturity is'
            : `${holdings.unmarked.length} maturities are`}{' '}
          missing a pool, so the principal held there has no price yet and is left out of this
          total.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {market.source === 'mock' ? (
          <FaucetButton
            pending={faucet.pending}
            disabled={isWrongNetwork || faucet.blocked}
            onClick={runFaucet}
          />
        ) : market.fundingHint ? (
          <p className="max-w-xs text-xs text-neutral-400">{market.fundingHint}</p>
        ) : (
          <span />
        )}
      </div>

      {faucet.outcome && (
        <div className="mt-3">
          <TxStatus outcome={faucet.outcome} onRetry={runFaucet} />
        </div>
      )}
    </section>
  )
}
