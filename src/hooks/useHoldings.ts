import { useMemo } from 'react'
import { useNow } from './useNow'
import type { MaturityPool } from './usePools'
import type { Portfolio } from './usePortfolio'
import { computeHoldings, type HoldingPosition, type Holdings } from '../lib/holdings'

/**
 * Joins the two reads the app already makes — the account's positions and the
 * pools that price them — into the single figure the overview leads with.
 *
 * The join lives here rather than in a component because both the overview and
 * the portfolio tab want the same number, and two components deriving a total
 * from the same rows is how the two screens end up disagreeing about what the
 * reader is worth.
 */
export function useHoldings(
  portfolio: Portfolio,
  pools: MaturityPool[],
  rate: bigint | null,
): Holdings {
  /* Chain time, not the local clock, and ticking: a PT crossing its maturity
     stops being a discounted claim and becomes one asset unit, and the total
     should say so on the minute it happens rather than on the next refetch.
     A minute is enough - nothing here changes between seconds. */
  const nowMs = useNow(60_000)

  return useMemo(() => {
    const byMaturity = new Map(pools.map((entry) => [entry.maturity, entry]))
    const positions: HoldingPosition[] = portfolio.positions.map(({ maturity, position }) => {
      const pool = byMaturity.get(maturity)
      return {
        maturity,
        pt: position.pt,
        yt: position.yt,
        claimable: position.claimable,
        lpBalance: pool?.lpBalance ?? 0n,
        pool: pool?.pool ?? null,
      }
    })

    // A pool the account holds LP in but has no PT/YT position for still owns
    // value; without this it would drop out of the total entirely.
    for (const entry of pools) {
      if (entry.lpBalance <= 0n) continue
      if (positions.some((position) => position.maturity === entry.maturity)) continue
      positions.push({
        maturity: entry.maturity,
        pt: 0n,
        yt: 0n,
        claimable: 0n,
        lpBalance: entry.lpBalance,
        pool: entry.pool,
      })
    }

    return computeHoldings({
      underlying: portfolio.underlying,
      sy: portfolio.sy,
      rate: rate ?? portfolio.rateInfo?.rate ?? 0n,
      nowSeconds: BigInt(Math.floor(nowMs / 1000)),
      positions,
    })
  }, [portfolio, pools, rate, nowMs])
}
