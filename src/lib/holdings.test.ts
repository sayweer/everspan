import { describe, expect, it } from 'vitest'
import { computeHoldings, type HoldingPosition } from './holdings'
import { RATE_SCALE } from './yield'

const ONE = RATE_SCALE
/** A pool where PT trades at 0.9 SY — the discount that becomes fixed yield. */
const POOL = { ptReserve: 1000n, syReserve: 900n, lpTotal: 100n }

function position(overrides: Partial<HoldingPosition> = {}): HoldingPosition {
  return { maturity: 100n, pt: 0n, yt: 0n, claimable: 0n, lpBalance: 0n, pool: POOL, ...overrides }
}

describe('computeHoldings', () => {
  it('counts the underlying balance and SY at the current rate', () => {
    const holdings = computeHoldings({
      underlying: 100n,
      sy: 100n,
      rate: (ONE * 3n) / 2n,
      nowSeconds: 0n,
      positions: [],
    })
    expect(holdings.liquid).toBe(250n)
    expect(holdings.total).toBe(250n)
  })

  it('marks PT at the pool before maturity', () => {
    const holdings = computeHoldings({
      underlying: 0n,
      sy: 0n,
      rate: ONE,
      nowSeconds: 50n,
      positions: [position({ pt: 100n })],
    })
    // 100 PT · (900/1000) SY per PT · 1.0 asset per SY.
    expect(holdings.principal).toBe(90n)
    expect(holdings.unmarked).toEqual([])
  })

  it('marks PT at face value once the maturity has settled', () => {
    const holdings = computeHoldings({
      underlying: 0n,
      sy: 0n,
      rate: ONE,
      nowSeconds: 100n,
      positions: [position({ pt: 100n })],
    })
    expect(holdings.principal).toBe(100n)
  })

  /*
   * The case the whole module exists for: no pool means no price, and a PT
   * counted at face value here would show a total the reader cannot realise.
   */
  it('leaves PT unmarked when the maturity has no pool, rather than guessing', () => {
    const holdings = computeHoldings({
      underlying: 40n,
      sy: 0n,
      rate: ONE,
      nowSeconds: 50n,
      positions: [position({ pt: 100n, pool: null })],
    })
    expect(holdings.principal).toBe(0n)
    expect(holdings.unmarked).toEqual([100n])
    expect(holdings.total).toBe(40n)
  })

  it('still redeems an unpooled PT at face value once it has settled', () => {
    const holdings = computeHoldings({
      underlying: 0n,
      sy: 0n,
      rate: ONE,
      nowSeconds: 100n,
      positions: [position({ pt: 100n, pool: null })],
    })
    expect(holdings.principal).toBe(100n)
    expect(holdings.unmarked).toEqual([])
  })

  it('reports YT beside the total and never inside it', () => {
    const holdings = computeHoldings({
      underlying: 10n,
      sy: 0n,
      rate: ONE,
      nowSeconds: 50n,
      positions: [position({ yt: 500n })],
    })
    expect(holdings.yt).toBe(500n)
    expect(holdings.total).toBe(10n)
  })

  it('converts claimable yield out of SY', () => {
    const holdings = computeHoldings({
      underlying: 0n,
      sy: 0n,
      rate: ONE * 2n,
      nowSeconds: 50n,
      positions: [position({ claimable: 40n })],
    })
    expect(holdings.claimable).toBe(80n)
    expect(holdings.total).toBe(80n)
  })

  it('marks an LP position pro-rata across both legs', () => {
    const holdings = computeHoldings({
      underlying: 0n,
      sy: 0n,
      rate: ONE,
      nowSeconds: 50n,
      positions: [position({ lpBalance: 10n })],
    })
    // 10/100 of the pool: 100 PT (marked at 90 SY) + 90 SY.
    expect(holdings.liquidity).toBe(180n)
  })

  it('marks the LP PT leg at face value after settlement', () => {
    const holdings = computeHoldings({
      underlying: 0n,
      sy: 0n,
      rate: ONE,
      nowSeconds: 100n,
      positions: [position({ lpBalance: 10n })],
    })
    expect(holdings.liquidity).toBe(190n)
  })

  it('marks nothing but the underlying when the rate is unknown', () => {
    const holdings = computeHoldings({
      underlying: 25n,
      sy: 900n,
      rate: 0n,
      nowSeconds: 50n,
      positions: [position({ pt: 100n, claimable: 10n, lpBalance: 10n })],
    })
    expect(holdings.total).toBe(25n)
    expect(holdings.unmarked).toEqual([100n])
  })

  it('adds the parts up to the total', () => {
    const holdings = computeHoldings({
      underlying: 100n,
      sy: 100n,
      rate: ONE,
      nowSeconds: 50n,
      positions: [position({ pt: 100n, yt: 100n, claimable: 40n, lpBalance: 10n })],
    })
    expect(holdings.total).toBe(
      holdings.liquid + holdings.principal + holdings.claimable + holdings.liquidity,
    )
    expect(holdings.total).toBe(200n + 90n + 40n + 180n)
  })
})
