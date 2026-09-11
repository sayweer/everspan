/**
 * Underlying ↔ SY conversion preview, shared by the Wrap card and by the
 * primary Lock/Long flows, which prepare SY behind the scenes rather than
 * asking a reader to hold or understand it.
 *
 * Shares are 1:1 with the underlying on the mock vault; on a Blend-backed
 * vault they are bTokens, so the live exchange rate converts between the two.
 * Both directions floor, matching the on-chain rounding — an estimate to show
 * before signing, not the authoritative amount.
 */
import type { MarketConfig } from '../config'
import { RATE_SCALE } from './yield'

/** Underlying → SY: what wrapping `amount` yields. */
export function previewWrapOutput(
  amount: bigint,
  market: MarketConfig,
  liveRate: bigint | null,
): bigint | null {
  if (amount <= 0n) return null
  if (market.source === 'mock') return amount
  if (liveRate === null || liveRate === 0n) return null
  return (amount * RATE_SCALE) / liveRate
}

/** SY → underlying: how much underlying it takes to wrap into `syAmount` SY. */
export function requiredUnderlyingForSy(
  syAmount: bigint,
  market: MarketConfig,
  liveRate: bigint | null,
): bigint | null {
  if (syAmount <= 0n) return 0n
  if (market.source === 'mock') return syAmount
  if (liveRate === null || liveRate === 0n) return null
  return (syAmount * liveRate) / RATE_SCALE
}

/**
 * Same conversion as {@link requiredUnderlyingForSy}, rounded up instead of
 * down. A flow that wraps a shortfall just ahead of using it (rather than
 * previewing a number for a reader to check) has to clear that shortfall —
 * floor rounding can leave it one stroop short and stall on itself.
 */
export function requiredUnderlyingForSyAtLeast(
  syAmount: bigint,
  market: MarketConfig,
  liveRate: bigint | null,
): bigint | null {
  if (syAmount <= 0n) return 0n
  if (market.source === 'mock') return syAmount
  if (liveRate === null || liveRate === 0n) return null
  return (syAmount * liveRate + RATE_SCALE - 1n) / RATE_SCALE
}
