/**
 * XLM balance for any account shape: a classic keypair account (`G...`) via
 * Horizon, or a Soroban smart wallet (`C...` — every passkey-created wallet)
 * via the native asset's SAC. Horizon's `/accounts` endpoint only ever
 * resolves the former; pointing it at a contract id fails every time, not
 * intermittently, which is what a passkey session used to hit here on every
 * load.
 */
import { Horizon } from '@stellar/stellar-sdk'
import { config } from '../config'
import type { AppError } from '../types'
import { isAppError } from '../types'
import { stroopsToXlm } from './amounts'
import { addressArg, simulateRead } from './contracts/base'
import { MYT_ERRORS } from './contracts/errors'

const server = new Horizon.Server(config.horizonUrl)

/** A Soroban contract id (passkey wallet); Horizon's account endpoint can't read this. */
function isContractAddress(address: string): boolean {
  return address.startsWith('C')
}

/**
 * Fetch the account's native XLM balance, from Horizon for a classic account
 * or from the native SAC for a smart-wallet contract id.
 * @param address - Account public key or contract id.
 * @returns the funded balance, `{ funded: false }` for an unfunded (404) classic
 *   account, or a friendly AppError for network issues.
 */
export async function getXlmBalance(
  address: string,
): Promise<{ balance: string; funded: true } | { funded: false } | AppError> {
  if (isContractAddress(address)) {
    return getContractXlmBalance(address)
  }
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

/**
 * A deployed smart wallet has no Horizon-style "doesn't exist yet" — it is
 * funded (the passkey relay sponsors its deployment) the moment it exists, so
 * this always reports `funded: true` rather than trying to invent a 404
 * equivalent for a contract account.
 */
async function getContractXlmBalance(
  address: string,
): Promise<{ balance: string; funded: true } | AppError> {
  const result = await simulateRead<bigint>(
    config.nativeAssetId,
    'balance',
    [addressArg(address)],
    MYT_ERRORS,
  )
  if (isAppError(result)) return result
  return { balance: stroopsToXlm(result), funded: true }
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
