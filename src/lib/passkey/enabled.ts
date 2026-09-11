/**
 * The one switch the whole passkey entry point hangs from.
 *
 * This feature exists to remove the wallet-install step while we are gathering
 * feedback on Testnet, and it is meant to be taken back out when the protocol
 * moves to mainnet — where a sponsored, recovery-less, server-funded wallet is
 * the wrong shape entirely. Two things make that removal cheap:
 *
 * 1. **Configuration is the switch.** There is no separate on/off flag to
 *    forget. The feature needs a deployed smart-wallet wasm hash to create
 *    wallets at all, so clearing that one value turns the entry point off
 *    everywhere, immediately, without a rebuild.
 *
 * 2. **It refuses to arm off Testnet.** The passphrase check is not a
 *    convenience — it is what makes it impossible to ship this to mainnet by
 *    accident, even with the value still set in a dashboard someone forgot to
 *    clear. A mainnet build has no passkey path, whatever its environment says.
 *
 * `docs/passkey.md` carries the full removal checklist. Every touch point this
 * feature has outside `src/lib/passkey/` and `api/` is tagged `PASSKEY-ENTRY`,
 * so `grep -rn PASSKEY-ENTRY` lists the whole surface.
 */
import { Networks } from '@stellar/stellar-sdk'
import { config } from '../../config'

export interface PasskeyRuntime {
  /** The network this build talks to. */
  networkPassphrase: string
  /** Hash of the smart-wallet wasm each passkey user gets deployed. */
  walletWasmHash: string
}

/**
 * Whether the passkey entry point may be offered at all.
 *
 * Fails closed on every count: no wasm hash, wrong network, or anything but the
 * exact Testnet passphrase, and the answer is no.
 */
export function passkeyEnabledFor(runtime: PasskeyRuntime): boolean {
  if (runtime.networkPassphrase !== Networks.TESTNET) return false
  return runtime.walletWasmHash.trim().length > 0
}

/** The same question, asked of this build's own configuration. */
export function passkeyEnabled(): boolean {
  return passkeyEnabledFor({
    networkPassphrase: config.networkPassphrase,
    walletWasmHash: config.passkeyWalletWasmHash,
  })
}
