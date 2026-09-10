/** What the account is worth, and the one control that hides it. */
import { useEffect, useState, type ReactElement } from 'react'
import type { Holdings } from '../lib/holdings'
import { formatAmount } from '../lib/format'
import { focusRing } from '../lib/buttonStyles'
import {
  ChartBarIcon,
  ChevronDownIcon,
  CoinsIcon,
  DropletIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from './icons'

interface BalanceHeroProps {
  holdings: Holdings
  symbol: string
  loading: boolean
  onConvert: () => void
  onPortfolio: () => void
  onLiquidity: () => void
}

const STORAGE_KEY = 'everspan:amounts-hidden'
const MASK = '••••••'

function initialHidden(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/*
 * The hide control is not a decoration borrowed from an exchange app. A balance
 * is the one thing on this screen a stranger can read at a glance over a
 * shoulder, and every other number here is a rate or a date that gives nothing
 * away. It persists because a reader who hides it once is telling us about
 * where they use this, not about this visit.
 */
export function BalanceHero({
  holdings,
  symbol,
  loading,
  onConvert,
  onPortfolio,
  onLiquidity,
}: BalanceHeroProps): ReactElement {
  const [hidden, setHidden] = useState(initialHidden)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, hidden ? '1' : '0')
    } catch {
      // The choice still holds for this visit.
    }
  }, [hidden])

  const parts = splitAmount(formatAmount(holdings.total, 4))
  /*
   * The parts the total is made of, each one a way into the screen that acts
   * on it. The reference this follows lists assets here; ours would have been
   * the portfolio tab printed twice, so the rows carry the same breakdown and
   * spend the tap on getting somewhere instead.
   */
  const segments = [
    {
      label: 'Liquid',
      hint: `${symbol} and SY you can act with now`,
      value: holdings.liquid,
      icon: <CoinsIcon className="h-5 w-5" />,
      onSelect: onConvert,
    },
    {
      label: 'Principal',
      hint: 'PT held, marked at the pool',
      value: holdings.principal,
      icon: <LockIcon className="h-5 w-5" />,
      onSelect: onPortfolio,
    },
    {
      label: 'Liquidity',
      hint: 'Your share of the pools',
      value: holdings.liquidity,
      icon: <DropletIcon className="h-5 w-5" />,
      onSelect: onLiquidity,
    },
    {
      label: 'Claimable',
      hint: 'Yield accrued and waiting',
      value: holdings.claimable,
      icon: <ChartBarIcon className="h-5 w-5" />,
      onSelect: onPortfolio,
    },
  ].filter((segment) => segment.value > 0n)

  return (
    <section aria-label="Total value" className="pb-2">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
        Total value
      </h2>

      <p
        className={`mt-2 flex items-baseline gap-2 tabular-nums text-neutral-50 ${
          loading ? 'opacity-60' : ''
        }`}
      >
        {/* The whole units carry the reading and the fraction rides underneath
            it: at this size a run of eight equal-weight digits is a number the
            reader has to parse rather than one they can take in. */}
        <span className="text-[2.75rem] font-medium leading-none tracking-[-0.05em]">
          {hidden ? MASK : parts.whole}
        </span>
        {!hidden && parts.fraction && (
          <span className="text-xl font-medium leading-none tracking-[-0.03em] text-neutral-400">
            .{parts.fraction}
          </span>
        )}
        <span className="text-sm font-medium text-neutral-400">{symbol}</span>
      </p>

      <div className="mt-3">
        <button
          type="button"
          aria-pressed={hidden}
          onClick={() => {
            setHidden((current) => !current)
          }}
          className={`inline-flex min-h-9 items-center gap-2 rounded-full border border-boundary px-3 text-xs text-neutral-300 transition-colors duration-100 hover:bg-raised hover:text-neutral-100 [touch-action:manipulation] [-webkit-tap-highlight-color:transparent] ${focusRing}`}
        >
          {hidden ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
          {hidden ? 'Show amounts' : 'Hide amounts'}
        </button>
      </div>

      {segments.length > 0 && (
        <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
          {segments.map((segment) => (
            <li key={segment.label}>
              <button
                type="button"
                onClick={segment.onSelect}
                className={`flex w-full items-center gap-3 py-3 text-left transition-colors duration-100 hover:bg-raised ${focusRing}`}
              >
                <span aria-hidden="true" className="shrink-0 text-neutral-400">
                  {segment.icon}
                </span>
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
      )}

      {holdings.yt > 0n && !hidden && (
        <p className="mt-3 text-xs leading-relaxed text-neutral-500">
          Plus {formatAmount(holdings.yt, 2)} YT. Yield tokens are not counted above — nothing in
          the protocol prices the yield they still have to release.
        </p>
      )}

      {holdings.unmarked.length > 0 && (
        <p className="mt-2 text-xs leading-relaxed text-warning-300">
          {holdings.unmarked.length === 1 ? 'One maturity is' : `${holdings.unmarked.length} maturities are`}{' '}
          missing a pool, so the PT held there has no price yet and is left out of this total.
        </p>
      )}
    </section>
  )
}

/** Split "1,234.5678" into its whole and fractional halves. */
function splitAmount(formatted: string): { whole: string; fraction: string } {
  const dot = formatted.indexOf('.')
  if (dot === -1) return { whole: formatted, fraction: '' }
  return { whole: formatted.slice(0, dot), fraction: formatted.slice(dot + 1) }
}
