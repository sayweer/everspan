import { describe, expect, it } from 'vitest'
import { INCLUSION_FEE, paddedResourceFee } from './fees'

describe('paddedResourceFee', () => {
  it('adds thirty percent of headroom to a quote', () => {
    expect(paddedResourceFee(1000n)).toBe(1300n)
    expect(paddedResourceFee(1n)).toBe(1n) // floors, never rounds up past integer math
  })

  it('leaves a non-positive quote alone', () => {
    expect(paddedResourceFee(0n)).toBe(0n)
    expect(paddedResourceFee(-5n)).toBe(0n)
  })

  it('bids above the network floor', () => {
    expect(Number(INCLUSION_FEE)).toBeGreaterThan(100)
  })
})
