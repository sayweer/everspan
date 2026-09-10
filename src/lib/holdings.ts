/**
 * What an account is worth, in the underlying asset.
 *
 * The hard part is not the arithmetic — it is refusing to state a number the
 * protocol cannot back. A PT is worth exactly one asset unit *at maturity* and
 * something less before it, and the only thing that knows how much less is the
 * pool. So a maturity with no pool has no mark, and this returns that fact
 * rather than quietly counting the PT at face value, which would show a reader
 * a total they cannot realise.
 *
 * YT is excluded outright. Its value is the yield still to come, and nothing in
 * this protocol prices that — the pool trades PT against SY. Folding YT in at
 * any number would be an invention, so it is reported beside the total instead
 * of inside it.
 *
 * Everything is integer stroop math. `ptCostInAsset` exists next door and would
 * have been shorter, but it returns a float for display; money does not go
 * through `Number` here.
 */
import { RATE_SCALE } from './yield'

/** Reserves and share supply for one maturity's pool. */
export interface HoldingPool {
  ptReserve: bigint
  syReserve: bigint
  lpTotal: bigint
}

export interface HoldingPosition {
  maturity: bigint
  pt: bigint
  yt: bigint
  /** Claimable yield, in SY. */
  claimable: bigint
  /** The account's LP shares in this maturity's pool. */
  lpBalance: bigint
  /** Null when the maturity has no pool, or the read failed. */
  pool: HoldingPool | null
}

export interface HoldingsInput {
  /** Underlying-asset balance, already in asset stroops. */
  underlying: bigint
  /** SY balance. */
  sy: bigint
  /** Current SY→asset exchange rate, `RATE_SCALE` fixed point. */
  rate: bigint
  /** Seconds since the epoch, for deciding which maturities have settled. */
  nowSeconds: bigint
  positions: readonly HoldingPosition[]
}

export interface Holdings {
  /** Everything below, added up, in asset stroops. */
  total: bigint
  /** Spendable right now: the underlying balance plus SY at the current rate. */
  liquid: bigint
  /** PT, marked at maturity value once settled and at the pool otherwise. */
  principal: bigint
  /** Yield already accrued and waiting to be claimed. */
  claimable: bigint
  /** The account's share of the pools it has provided to. */
  liquidity: bigint
  /** YT held. Never part of `total` — see the note above. */
  yt: bigint
  /** Maturities holding PT or LP that could not be marked. */
  unmarked: bigint[]
}

/** SY → underlying asset at a given rate. */
function syToAsset(sy: bigint, rate: bigint): bigint {
  if (sy <= 0n || rate <= 0n) return 0n
  return (sy * rate) / RATE_SCALE
}

/**
 * The pool's marginal price, as an integer: what one lot of PT is worth in SY
 * at the current reserve ratio. This is a mid mark, not a quote — selling the
 * whole holding would move the price against the seller, and pricing a balance
 * sheet at its own exit impact would understate every position that is merely
 * being held.
 */
function ptToSy(pt: bigint, pool: HoldingPool): bigint {
  if (pt <= 0n || pool.ptReserve <= 0n || pool.syReserve <= 0n) return 0n
  return (pt * pool.syReserve) / pool.ptReserve
}

export function computeHoldings({
  underlying,
  sy,
  rate,
  nowSeconds,
  positions,
}: HoldingsInput): Holdings {
  const liquid = underlying + syToAsset(sy, rate)
  let principal = 0n
  let claimable = 0n
  let liquidity = 0n
  let yt = 0n
  const unmarked: bigint[] = []

  for (const entry of positions) {
    yt += entry.yt
    claimable += syToAsset(entry.claimable, rate)

    const settled = nowSeconds >= entry.maturity
    const pool = entry.pool
    const priceable = pool !== null && pool.ptReserve > 0n && pool.syReserve > 0n && rate > 0n

    if (entry.pt > 0n) {
      if (settled) {
        // Past maturity a PT is redeemable for exactly one asset unit, so it
        // needs no pool and carries no discount.
        principal += entry.pt
      } else if (priceable) {
        principal += syToAsset(ptToSy(entry.pt, pool), rate)
      } else {
        unmarked.push(entry.maturity)
      }
    }

    if (entry.lpBalance > 0n) {
      if (pool === null || pool.lpTotal <= 0n || rate <= 0n) {
        if (!unmarked.includes(entry.maturity)) unmarked.push(entry.maturity)
      } else {
        const ptOut = (entry.lpBalance * pool.ptReserve) / pool.lpTotal
        const syOut = (entry.lpBalance * pool.syReserve) / pool.lpTotal
        // The PT leg of an LP position is marked the same way a held PT is:
        // at maturity value once settled, at the pool ratio before that.
        const ptLeg = settled ? ptOut : syToAsset(ptToSy(ptOut, pool), rate)
        liquidity += ptLeg + syToAsset(syOut, rate)
      }
    }
  }

  return {
    total: liquid + principal + claimable + liquidity,
    liquid,
    principal,
    claimable,
    liquidity,
    yt,
    unmarked,
  }
}
