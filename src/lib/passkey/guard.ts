/**
 * The relay's admission gate.
 *
 * The relay endpoint ships its URL in the client bundle, so it is public and
 * every byte reaching it is untrusted. Its entire security model is this file:
 * decode what the transaction *actually* does and check that against an
 * allowlist. A relay that trusted a client's claim about its own call would be
 * an open faucet paying fees for anyone's contract calls.
 *
 * Pure and framework-agnostic so it can be tested here rather than only in a
 * deployed function, where a mistake is invisible until someone finds it.
 *
 * Two admission routes, because Everspan has two kinds of contract:
 *
 * - **By address.** The vault, the Market and the AMM are deployed once per
 *   market and their ids are known ahead of time.
 * - **By code.** PT and YT are factory-deployed per maturity, so their
 *   addresses cannot be listed in advance. They are admitted by the hash of
 *   the wasm they run, read back from the chain — never from the request.
 */
import { Address, xdr } from '@stellar/stellar-sdk'

const CONTRACT_ID = /^C[A-Z2-7]{55}$/

export type HostCall =
  | { kind: 'invoke'; contractId: string }
  | { kind: 'deploy'; wasmHash: string }
  | { kind: 'other' }

/** Read what a host function actually asks for, or `other` if unrecognised. */
export function classifyHostFunction(funcXdr: string): HostCall {
  let fn: xdr.HostFunction
  try {
    fn = xdr.HostFunction.fromXDR(funcXdr, 'base64')
  } catch {
    return { kind: 'other' }
  }

  const name = fn.switch().name
  if (name === 'hostFunctionTypeInvokeContract') {
    try {
      return {
        kind: 'invoke',
        contractId: Address.fromScAddress(fn.invokeContract().contractAddress()).toString(),
      }
    } catch {
      return { kind: 'other' }
    }
  }

  if (name === 'hostFunctionTypeCreateContractV2' || name === 'hostFunctionTypeCreateContract') {
    try {
      const args =
        name === 'hostFunctionTypeCreateContractV2' ? fn.createContractV2() : fn.createContract()
      const executable = args.executable()
      return executable.switch().name === 'contractExecutableWasm'
        ? { kind: 'deploy', wasmHash: executable.wasmHash().toString('hex') }
        : { kind: 'other' }
    } catch {
      return { kind: 'other' }
    }
  }

  // Raw wasm uploads and anything the SDK does not name: refused.
  return { kind: 'other' }
}

export interface GuardConfig {
  /** Contract ids admitted by address — fixed, known-good deployments. */
  contracts: readonly string[]
  /** Wasm hashes admitted by code — per-user or per-maturity contracts. */
  wasmHashes: readonly string[]
  /** Reads a deployed contract's wasm hash from the chain. */
  readWasmHash: (contractId: string) => Promise<string | null>
}

function sameHash(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}

/**
 * Whether the relay may sponsor a call to `contractId`.
 *
 * Fails closed on every count: a malformed id, an RPC outage while reading the
 * code, and unrecognised code all refuse. The alternative to failing closed
 * here is paying for calls nobody vetted.
 */
export async function isRelayAllowed(contractId: string, cfg: GuardConfig): Promise<boolean> {
  if (!CONTRACT_ID.test(contractId)) return false
  if (cfg.contracts.includes(contractId)) return true
  if (cfg.wasmHashes.length === 0) return false

  let hash: string | null
  try {
    hash = await cfg.readWasmHash(contractId)
  } catch {
    return false
  }
  return hash !== null && cfg.wasmHashes.some((allowed) => sameHash(allowed, hash))
}

/** Whether the relay may sponsor a deployment of `wasmHash`. */
export function isDeployAllowed(wasmHash: string, wasmHashes: readonly string[]): boolean {
  return wasmHashes.some((allowed) => sameHash(allowed, wasmHash))
}

/** Decide on a whole host function. The single question the endpoint asks. */
export async function admits(funcXdr: string, cfg: GuardConfig): Promise<boolean> {
  const call = classifyHostFunction(funcXdr)
  if (call.kind === 'invoke') return isRelayAllowed(call.contractId, cfg)
  if (call.kind === 'deploy') return isDeployAllowed(call.wasmHash, cfg.wasmHashes)
  return false
}

/** Split a comma-separated environment value into a clean list. */
export function parseList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}
