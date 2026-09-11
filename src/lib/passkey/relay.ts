/**
 * Talking to the fee-sponsorship relay.
 *
 * A smart wallet holds no XLM when it is born and cannot pay for its own
 * deployment, so a server-held keypair pays the fee and submits on its behalf.
 * What keeps that from being a custody hole is the split of duties: the
 * reader's passkey signs the authorization entries, and the relay may only
 * submit *those exact entries*. It pays; it does not get to choose what for.
 *
 * Errors come back as `AppError` rather than thrown, because the contract
 * error classifier next door is built to read `Error(Contract, #N)` out of
 * chain failures and would flatten a relay's own answers into a generic
 * message. A 403 in particular has to survive intact: it means the relay is
 * not cleared to sponsor this call, and retrying will never help.
 */
import type { AppError } from '../../types'

/** The shape of an assembled transaction this module needs to read. */
export interface AssembledLike {
  built?: {
    operations?: ReadonlyArray<{
      func?: { toXDR(format: 'base64'): string }
      auth?: ReadonlyArray<{ toXDR(format: 'base64'): string }>
    }>
  }
}

export interface RelayPayload {
  func: string
  auth: string[]
}

const NOT_PREPARED: AppError = {
  code: 'passkey_not_prepared',
  message: 'That transaction could not be prepared. Try again.',
}

/**
 * Pull the host function and the already-signed auth entries out of an
 * assembled transaction. Returns an `AppError` rather than throwing so the
 * caller keeps one error shape.
 */
export function decodeAssembled(tx: AssembledLike): RelayPayload | AppError {
  const operation = tx.built?.operations?.[0]
  if (!operation?.func) return NOT_PREPARED
  return {
    func: operation.func.toXDR('base64'),
    auth: (operation.auth ?? []).map((entry) => entry.toXDR('base64')),
  }
}

function relayFailure(status: number): AppError {
  if (status === 403) {
    return {
      code: 'passkey_not_sponsored',
      message: 'Everspan is not cleared to sponsor that transaction. Retrying will not help.',
    }
  }
  if (status === 503) {
    return {
      code: 'passkey_relay_unconfigured',
      message: 'Fee sponsorship is not available right now. Connect a wallet to continue.',
    }
  }
  return {
    code: 'passkey_relay_failed',
    message: 'Could not submit that transaction. Try again.',
  }
}

async function post(
  fetchImpl: typeof fetch,
  body: unknown,
): Promise<{ hash: string } | AppError> {
  let response: Response
  try {
    response = await fetchImpl('/api/relay', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    return {
      code: 'network_error',
      message: 'Could not reach Everspan. Check your connection and try again.',
    }
  }

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) return relayFailure(response.status)

  const hash =
    payload !== null && typeof payload === 'object' && 'hash' in payload
      ? String((payload as { hash: unknown }).hash)
      : ''
  if (!hash) return relayFailure(502)
  return { hash }
}

/** Submit a signed contract call through the relay. */
export async function relayAssembled(
  fetchImpl: typeof fetch,
  tx: AssembledLike,
): Promise<{ hash: string } | AppError> {
  const decoded = decodeAssembled(tx)
  if ('code' in decoded) return decoded
  return post(fetchImpl, decoded)
}

/**
 * Submit a fully signed envelope. passkey-kit signs the initial wallet deploy
 * itself and hands back a whole transaction rather than a bare host function,
 * so that one case takes its own shape.
 */
export function relayEnvelope(
  fetchImpl: typeof fetch,
  envelopeXdr: string,
): Promise<{ hash: string } | AppError> {
  return post(fetchImpl, { xdr: envelopeXdr })
}
