/**
 * Fee arithmetic for relayed transactions.
 *
 * Both numbers here are the answer to the same problem: a fee that was correct
 * when it was quoted is often wrong by the time it is submitted.
 */

/**
 * The network's floor gets outbid the moment there is any queue, and a relayed
 * transaction the reader is waiting on is the wrong place to save a fraction of
 * a cent. 0.01 XLM.
 */
export const INCLUSION_FEE = '100000'

/**
 * Simulation prices resources against ledger state that is usually a little
 * stale by the time the transaction lands, and a resource fee that comes up
 * short fails the transaction outright rather than delaying it. Thirty percent
 * of headroom is cheap next to a failed submission the reader has to repeat.
 */
export function paddedResourceFee(quoted: bigint): bigint {
  if (quoted <= 0n) return 0n
  return (quoted * 130n) / 100n
}
