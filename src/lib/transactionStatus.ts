import { Api, Server } from '@stellar/stellar-sdk/rpc'
import { config } from '../config'
import type { AppError } from '../types'

const server = new Server(config.sorobanRpcUrl)

export type CheckedTransactionStatus = 'success' | 'failed' | 'not_found'

/** Keep RPC status interpretation pure so every finality branch is testable. */
export function interpretTransactionStatus(status: unknown): CheckedTransactionStatus | AppError {
  switch (status) {
    case Api.GetTransactionStatus.SUCCESS:
      return 'success'
    case Api.GetTransactionStatus.FAILED:
      return 'failed'
    case Api.GetTransactionStatus.NOT_FOUND:
      return 'not_found'
    default:
      return {
        code: 'transaction_status_unknown',
        message: 'Stellar returned an unknown transaction status. Wait a moment and check again.',
      }
  }
}

/**
 * Ask Stellar RPC for the final state of a previously submitted transaction.
 * A missing result is intentionally distinct from failure: recent transactions
 * may not have reached the RPC node yet, so callers should retain any safety
 * lock and let the user check again.
 */
export async function checkTransactionStatus(
  hash: string,
): Promise<CheckedTransactionStatus | AppError> {
  try {
    const response = await server.getTransaction(hash)

    return interpretTransactionStatus(response.status)
  } catch {
    return {
      code: 'transaction_status_unavailable',
      message:
        'Everspan could not reach Stellar to verify this transaction. Your actions remain locked; check again when the connection is stable.',
    }
  }
}

const FAILED_ON_CHAIN: AppError = {
  code: 'transaction_failed_on_chain',
  message: 'The network rejected this transaction. Nothing was moved.',
}

const NOT_CONFIRMED: AppError = {
  code: 'transaction_unconfirmed',
  message:
    'The network has not confirmed this transaction yet. Check its status before trying again.',
}

/**
 * Wait for a submitted transaction to reach a final state, for submissions
 * that arrive as a bare hash (the passkey relay) with nothing watching them.
 * Resolves to `null` only on SUCCESS; anything else is an `AppError`, and the
 * caller's safety record keeps the hash so a still-pending one can be checked.
 */
export async function awaitConfirmation(
  hash: string,
  {
    check = checkTransactionStatus,
    attempts = 30,
    delayMs = 2000,
  }: {
    check?: (hash: string) => Promise<CheckedTransactionStatus | AppError>
    attempts?: number
    delayMs?: number
  } = {},
): Promise<AppError | null> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const status = await check(hash)
    if (status === 'success') return null
    if (status === 'failed') return FAILED_ON_CHAIN
    // `not_found` and a transient RPC error both mean "not known yet".
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return NOT_CONFIRMED
}
