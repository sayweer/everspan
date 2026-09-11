/**
 * Submitting a write from a passkey session.
 *
 * The difference from the wallet path is not cosmetic. A smart wallet is a
 * contract, not an account: it cannot be a transaction's source and it holds no
 * XLM to pay with. So the transaction is simulated against a throwaway source,
 * the wallet authorizes it as the *caller* named in the contract arguments, and
 * the relay rebuilds it on a funded account carrying those exact signatures.
 *
 * What keeps that honest is that the relay never re-simulates. It submits the
 * authorization entries this file produced and nothing else — it pays, it does
 * not choose.
 */
import type { AppError } from '../../types'
import { ensureOpen, signAssembled } from './kit'
import { relayAssembled, type AssembledLike } from './relay'
import { storedCredentialId } from './session'

/** The phase callback `invokeWrite` threads through, in the shape it uses. */
type OnPhase = (phase: 'building' | 'signing' | 'pending', hash?: string) => boolean | undefined

export async function submitThroughRelay(
  tx: AssembledLike,
  walletAddress: string,
  onPhase: OnPhase,
): Promise<{ hash: string } | AppError> {
  // A reload keeps the session record but not the kit's in-memory connection,
  // and signing needs the connection.
  const reopened = await ensureOpen(walletAddress, storedCredentialId() ?? undefined)
  if (reopened) return reopened

  const signed = await signAssembled(tx)
  if ('code' in signed) return signed as AppError

  const sent = await relayAssembled(fetch, signed as AssembledLike)
  if ('code' in sent) return sent

  onPhase('pending', sent.hash)
  return sent
}
