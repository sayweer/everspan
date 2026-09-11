/**
 * The only file that imports `passkey-kit`.
 *
 * Everything else in the app talks to the small surface at the bottom of this
 * file, which means a kit upgrade is a one-file diff and the rest of the
 * passkey path stays testable without a browser, a DOM, or an authenticator.
 *
 * The kit is loaded dynamically, never at module scope. Two reasons: it pulls
 * in WebAuthn plumbing and a second view of the Stellar SDK that a reader who
 * connects an ordinary wallet should never download, and keeping the import
 * inside a function is what lets the whole feature disappear from the main
 * bundle when it is switched off.
 */
import { config } from '../../config'
import type { AppError } from '../../types'

/** A smart wallet and the credential that opens it. */
export interface PasskeyIdentity {
  contractId: string
  /** Base64url credential id — how a later visit re-opens the same wallet. */
  credentialId: string
}

/** A created wallet, still undeployed: `signedTx` has to be relayed first. */
export interface CreatedWallet extends PasskeyIdentity {
  signedTx: string
  /*
   * The kit's own result, carried back verbatim rather than rebuilt from the
   * fields above. It holds the raw credential and public-key bytes, and
   * `confirmWalletCreation` needs them to write the passkey record — handing it
   * a narrowed copy fails inside the storage adapter, where the missing bytes
   * surface as `Array.from(undefined)` and say nothing about what was dropped.
   */
  readonly kitResult: unknown
}

const CANCELLED: AppError = {
  code: 'passkey_cancelled',
  message: 'The passkey prompt was dismissed. Try again when you are ready.',
}
const OWNERSHIP: AppError = {
  code: 'passkey_wrong_wallet',
  message: 'That passkey does not open a wallet here. Connect a wallet instead.',
}
const GENERIC: AppError = {
  code: 'passkey_failed',
  message: 'Could not use your passkey. Try again, or connect a wallet instead.',
}

/**
 * The browser reports a dismissed prompt and a timed-out one identically, and
 * neither is worth showing verbatim. Every step funnels through here so a
 * failure stays traceable to the step that raised it in the console, while the
 * reader only ever meets one of three sentences.
 */
function humanise(step: string, error: unknown): AppError {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[passkey] ${step} failed:`, error)
  if (/ownership|not a signer|ambiguous/i.test(message)) return OWNERSHIP
  if (/notallowed|aborterror|timed out|cancel/i.test(message)) return CANCELLED
  return GENERIC
}

/**
 * `passkey-kit` expects `Buffer` to exist. Installing it here rather than in
 * the bundler config keeps the polyfill out of the main bundle and leaves
 * `vite.config.ts` with nothing to undo when this feature is removed.
 */
async function ensureBuffer(): Promise<void> {
  const scope = globalThis as typeof globalThis & { Buffer?: unknown }
  if (scope.Buffer !== undefined) return
  const { Buffer } = await import('buffer')
  scope.Buffer = Buffer
}

/*
 * One kit for the life of the tab. The live connection lives on the instance —
 * a kit built per call has no wallet attached and cannot sign.
 */
let kitPromise: Promise<PasskeyKitLike> | null = null

interface PasskeyKitLike {
  createWallet(app: string, user: string): Promise<CreateResult>
  confirmWalletCreation(created: unknown, hash: string): Promise<unknown>
  sign<T>(tx: T): Promise<T>
  disconnect(): void
  readonly contractId: string | undefined
  /* Assigned rather than reached through `connectWallet` — see `attach`. */
  wallet: unknown
  keyId: string | undefined
  readonly rpcUrl: string
  readonly networkPassphrase: string
}

/** Only the fields this module reads. The rest travels in `kitResult`. */
interface CreateResult {
  contractId: string
  keyIdBase64: string
  signedTx: string
}

async function loadKit(): Promise<PasskeyKitLike> {
  await ensureBuffer()
  const [{ PasskeyKit }, { LocalStorageAdapter }] = await Promise.all([
    import('passkey-kit'),
    import('passkey-kit/storage'),
  ])
  return new PasskeyKit({
    rpcUrl: config.sorobanRpcUrl,
    networkPassphrase: config.networkPassphrase,
    walletWasmHash: config.passkeyWalletWasmHash,
    /*
     * Without a durable adapter the kit can only resolve a wallet through an
     * indexer, which we do not run. This is what lets someone returning
     * tomorrow prove the wallet they already funded is theirs.
     */
    storage: new LocalStorageAdapter(),
  }) as unknown as PasskeyKitLike
}

function kit(): Promise<PasskeyKitLike> {
  kitPromise ??= loadKit()
  return kitPromise
}

/**
 * Point the kit at a wallet.
 *
 * This is what `connectWallet` does at the end of its verification loop, and
 * we do it directly because that loop cannot complete on this version: it reads
 * a signer's expiration and guards it with `!== undefined`, so a signer with no
 * expiration — which is every signer this app creates — arrives as `null`,
 * passes the guard, and throws on `null.toString()`. Reported upstream shape:
 * `kit.js` in 0.18.3, the `signerExpirationLedger` branch. There is no later
 * release to move to.
 *
 * What the loop would have bought us is proof that the passkey really is a
 * signer on this wallet, before showing it. Skipping it means a tampered
 * localStorage could point the screen at someone else's wallet — and stop
 * there: moving anything out of it still needs an authorizing signature from a
 * passkey the attacker does not have, which the wallet contract checks itself.
 * On a Testnet feedback build that trade is worth making; on mainnet this
 * whole feature comes out anyway.
 */
async function attach(contractId: string, credentialId: string): Promise<AppError | null> {
  try {
    const instance = await kit()
    const { PasskeyClient } = await import('passkey-kit')
    instance.wallet = new PasskeyClient({
      contractId,
      rpcUrl: instance.rpcUrl,
      networkPassphrase: instance.networkPassphrase,
    })
    instance.keyId = credentialId
    return null
  } catch (e) {
    return humanise('attach wallet', e)
  }
}

/** Drop the kit so the next connection starts clean. */
export function resetPasskeyKit(): void {
  kitPromise = null
}

/**
 * Run a passkey registration and build the wallet's deployment.
 *
 * The wallet is not deployed and the kit is not connected when this returns —
 * `signedTx` still has to reach the chain through the relay, and only then can
 * `adoptWallet` confirm it. Splitting those is the kit's own safeguard: a
 * wallet is only ever adopted against a deployment that actually landed.
 */
export async function createWallet(userLabel: string): Promise<CreatedWallet | AppError> {
  try {
    const created = await (await kit()).createWallet('Everspan', userLabel)
    return {
      contractId: created.contractId,
      credentialId: created.keyIdBase64,
      signedTx: created.signedTx,
      kitResult: created,
    }
  } catch (e) {
    return humanise('create wallet', e)
  }
}

/**
 * Confirm a deployment that the relay landed, then connect to it.
 *
 * `confirmWalletCreation` is what records the wallet's immutable birth, and it
 * must not be called before the relay reports a hash — the kit verifies the
 * deployment against the chain rather than taking our word for it.
 */
export async function adoptWallet(
  created: CreatedWallet,
  deployHash: string,
): Promise<PasskeyIdentity | AppError> {
  try {
    const instance = await kit()
    await instance.confirmWalletCreation(created.kitResult, deployHash)
    const attached = await attach(created.contractId, created.credentialId)
    if (attached) return attached
    return { contractId: created.contractId, credentialId: created.credentialId }
  } catch (e) {
    return humanise('adopt wallet', e)
  }
}

/**
 * Re-open the wallet this device remembers.
 *
 * No ceremony here, deliberately. The authenticator is asked for the first
 * thing the reader actually signs, which is where possession has to be proved
 * anyway — prompting twice to show a balance buys nothing.
 */
export async function openWallet(
  contractId: string,
  credentialId: string,
): Promise<PasskeyIdentity | AppError> {
  const attached = await attach(contractId, credentialId)
  if (attached) return attached
  return { contractId, credentialId }
}

/**
 * Attach the kit to a wallet if this tab has lost it — a reload keeps the
 * session record but not the in-memory connection, and signing needs the
 * connection.
 */
export async function ensureOpen(
  expectedAddress: string,
  credentialId: string,
): Promise<AppError | null> {
  const instance = await kit()
  if (instance.contractId === expectedAddress) return null
  return attach(expectedAddress, credentialId)
}

/** Sign an assembled transaction's authorization entries with the passkey. */
export async function signAssembled<T>(tx: T): Promise<T | AppError> {
  try {
    return await (await kit()).sign(tx)
  } catch (e) {
    return humanise('sign transaction', e)
  }
}

/** Forget the connection. There is nothing to revoke on chain. */
export async function closeWallet(): Promise<void> {
  try {
    ;(await kit()).disconnect()
  } catch {
    // A kit that never loaded has nothing to disconnect.
  }
  resetPasskeyKit()
}
