/** Stellar SDK service: Horizon account/balance queries (native XLM wallet balance). */
import { Horizon } from '@stellar/stellar-sdk'
import { config } from '../config'
import type { AppError } from '../types'

const server = new Horizon.Server(config.horizonUrl)

/**
 * Fetch the account's native XLM balance from Horizon.
 * @param address - Account public key.
 * @returns the funded balance, `{ funded: false }` for an unfunded (404) account,
 *   or a friendly AppError for network issues.
 */
export async function getXlmBalance(
  address: string,
): Promise<{ balance: string; funded: true } | { funded: false } | AppError> {
  try {
    return await loadNativeBalance(address)
  } catch (e) {
    if (isNotFound(e)) {
      return { funded: false }
    }
    // A blip (dropped wifi, a slow relay) is common enough to deserve one
    // silent retry before we bother the reader with an error card.
    await new Promise((resolve) => setTimeout(resolve, 800))
    try {
      return await loadNativeBalance(address)
    } catch (e2) {
      if (isNotFound(e2)) {
        return { funded: false }
      }
      return {
        code: 'balance_unavailable',
        message: isNetworkUnreachable(e2)
          ? 'Could not reach the Stellar network. Check your internet connection, or disable a VPN or ad blocker that might be blocking the request, and try again.'
          : 'Could not load your balance from the network. Check your connection and try again.',
      }
    }
  }
}

async function loadNativeBalance(
  address: string,
): Promise<{ balance: string; funded: true }> {
  const account = await server.loadAccount(address)
  const native = account.balances.find((b) => b.asset_type === 'native')
  return { balance: native ? native.balance : '0', funded: true }
}

/** True when a Horizon error indicates the resource does not exist (HTTP 404). */
function isNotFound(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) {
    return false
  }
  const response = (e as { response?: { status?: number } }).response
  return response?.status === 404
}

/**
 * True when the request never reached Horizon at all (offline, DNS failure, a
 * CORS block) rather than Horizon responding with an error status. The SDK's
 * `response` field is only ever set once a response actually arrives.
 */
function isNetworkUnreachable(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) {
    return true
  }
  return (e as { response?: unknown }).response === undefined
}
