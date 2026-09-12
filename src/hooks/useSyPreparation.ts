/**
 * The "spend in your own asset, never in SY" arithmetic shared by every form
 * that has to prepare a shortfall before its real transaction: how much of
 * the underlying an entered amount converts to, how much SY that's short by,
 * and how much underlying a Prepare step would need to wrap to cover it.
 *
 * Pure computation only — each caller still owns its own submit handlers,
 * because what happens once the shortfall is prepared (swap, split, add
 * liquidity) differs enough per form that folding it in here would trade a
 * few lines of duplication for a much less legible one-hook-fits-all control
 * flow.
 */
import type { MarketConfig } from '../config'
import { isValidTokenAmount, type AmountResult } from '../lib/validation'
import {
  previewWrapOutput,
  requiredUnderlyingForSy,
  requiredUnderlyingForSyAtLeast,
} from '../lib/wrap'

export interface SyPreparation {
  /** Underlying spendable directly, plus what the wallet's SY converts to. */
  maxSpendable: bigint
  valid: AmountResult
  /** The entered amount, in underlying stroops (0 while the field is invalid/empty). */
  underlyingIn: bigint
  /** SY the trade needs at the entered amount. */
  syNeeded: bigint
  /** How much more SY this needs than the wallet already holds. */
  syShort: bigint
  /** Underlying a Prepare step would wrap to close that shortfall. */
  underlyingToWrap: bigint
  needsPrepare: boolean
}

export function useSyPreparation(
  amount: string,
  underlyingBalance: bigint,
  syBalance: bigint,
  market: MarketConfig,
  liveRate: bigint | null,
): SyPreparation {
  const syAsUnderlying = requiredUnderlyingForSy(syBalance, market, liveRate) ?? 0n
  const maxSpendable = underlyingBalance + syAsUnderlying
  const valid = isValidTokenAmount(amount, maxSpendable, { label: market.underlyingSymbol })
  const underlyingIn = valid.ok ? valid.stroops : 0n
  const syNeeded = underlyingIn > 0n ? (previewWrapOutput(underlyingIn, market, liveRate) ?? 0n) : 0n
  const syShort = syNeeded > syBalance ? syNeeded - syBalance : 0n
  const underlyingToWrap =
    syShort > 0n ? (requiredUnderlyingForSyAtLeast(syShort, market, liveRate) ?? 0n) : 0n

  return {
    maxSpendable,
    valid,
    underlyingIn,
    syNeeded,
    syShort,
    underlyingToWrap,
    needsPrepare: syShort > 0n,
  }
}
