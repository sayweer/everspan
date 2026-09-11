/**
 * Getting in with a passkey: one tap to a deployed, funded wallet.
 *
 * The order matters and is not rearrangeable. The kit builds a deployment but
 * stays disconnected; the relay has to land it; only then can the kit confirm
 * the wallet against the chain and adopt it. Funding comes last because there
 * is no wallet to fund until the deployment is real.
 */
import type { AppError } from '../../types'
import { isAppError } from '../../types'
import { adoptWallet, closeWallet, createWallet, openWallet } from './kit'
import { relayEnvelope } from './relay'
import { endPasskeySession, rememberedWallet, startPasskeySession } from './session'

/** What the reader is called in their authenticator's list of passkeys. */
const USER_LABEL = 'Everspan Testnet'

/**
 * Ask the faucet for starting funds.
 *
 * Deliberately non-fatal. A reader whose wallet exists but arrived empty is
 * better served by being let into the app with something to retry than by
 * being stopped at the door over a faucet hiccup — the wallet is already
 * theirs either way.
 */
async function requestFunding(wallet: string): Promise<AppError | null> {
  try {
    const response = await fetch('/api/faucet', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ wallet }),
    })
    if (response.ok) return null
    const body: unknown = await response.json().catch(() => null)
    const message =
      body !== null && typeof body === 'object' && 'error' in body
        ? String((body as { error: unknown }).error)
        : 'Could not send starting funds.'
    return { code: 'passkey_funding_failed', message }
  } catch {
    return {
      code: 'passkey_funding_failed',
      message: 'Could not reach the faucet for starting funds.',
    }
  }
}

export interface PasskeyConnection {
  address: string
  /** Set when the wallet exists but arrived without starting funds. */
  fundingError: AppError | null
}

/** Register a passkey, deploy its wallet through the relay, and fund it. */
export async function createPasskeyWallet(): Promise<PasskeyConnection | AppError> {
  const created = await createWallet(USER_LABEL)
  if (isAppError(created)) return created

  const deployed = await relayEnvelope(fetch, created.signedTx)
  if (isAppError(deployed)) return deployed

  const identity = await adoptWallet(created, deployed.hash)
  if (isAppError(identity)) return identity

  startPasskeySession(identity.contractId, identity.credentialId)
  return { address: identity.contractId, fundingError: await requestFunding(identity.contractId) }
}

/**
 * Re-open the wallet this device already holds a credential for.
 *
 * Kept apart from creation on purpose: a returning reader should land back in
 * the wallet they funded, not mint an empty second one and lose sight of the
 * position they opened.
 */
export async function reopenPasskeyWallet(): Promise<PasskeyConnection | AppError> {
  const remembered = rememberedWallet()
  if (!remembered) {
    return {
      code: 'passkey_not_remembered',
      message: 'This device does not remember a wallet. Create one, or connect a wallet instead.',
    }
  }
  const identity = await openWallet(remembered.address, remembered.credentialId)
  if (isAppError(identity)) return identity
  startPasskeySession(identity.contractId, identity.credentialId)
  return { address: identity.contractId, fundingError: null }
}

/** End the session. The credential survives so the wallet can be re-opened. */
export async function disconnectPasskey(): Promise<void> {
  endPasskeySession()
  await closeWallet()
}
