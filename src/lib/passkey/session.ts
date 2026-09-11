/**
 * The passkey session: which smart wallet this tab is acting as, and which
 * credential can re-open it later.
 *
 * Two storages on purpose. The *session* — the wallet this tab is currently
 * acting as — lives in `sessionStorage`, so closing the tab ends it the way a
 * connected wallet session ends. The *credential id* lives in `localStorage`,
 * because it is not a session at all: it is the only thing that lets someone
 * coming back tomorrow re-open the wallet they already have rather than
 * minting a second one. Without it a returning reader gets a fresh, empty
 * wallet and loses sight of the position they opened yesterday, which is
 * exactly the feedback we are here to collect.
 *
 * No React, no passkey-kit — importing this must stay free, because the write
 * path asks it a question on every transaction.
 */

const SESSION_ADDRESS = 'everspan:passkey:address'
const CREDENTIAL_ID = 'everspan:passkey:credential'
const REMEMBERED_ADDRESS = 'everspan:passkey:wallet'

function read(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    // Private windows and storage-blocking settings throw rather than return
    // null. A reader with no storage can still use the app for this tab.
    return null
  }
}

function write(storage: Storage, key: string, value: string | null): void {
  try {
    if (value === null) storage.removeItem(key)
    else storage.setItem(key, value)
  } catch {
    // The in-memory session still holds for this visit.
  }
}

/** The smart wallet this tab is acting as, or null for a wallet/no session. */
export function passkeyAddress(): string | null {
  return read(sessionStorage, SESSION_ADDRESS)
}

/**
 * Whether writes from this tab go through the relay rather than the connected
 * wallet. Asked once per transaction, so it stays a synchronous storage read.
 */
export function isPasskeySession(): boolean {
  return passkeyAddress() !== null
}

/** The credential that can re-open this reader's existing wallet, if any. */
export function storedCredentialId(): string | null {
  return read(localStorage, CREDENTIAL_ID)
}

/**
 * The wallet this device remembers, if any — a public address and the
 * credential that opens it. Both are durable: a returning reader needs the
 * address as much as the credential, and neither is a secret.
 */
export function rememberedWallet(): { address: string; credentialId: string } | null {
  const address = read(localStorage, REMEMBERED_ADDRESS)
  const credentialId = read(localStorage, CREDENTIAL_ID)
  return address !== null && credentialId !== null ? { address, credentialId } : null
}

/** Adopt a smart wallet as this tab's session and remember how to re-open it. */
export function startPasskeySession(address: string, credentialId: string): void {
  write(sessionStorage, SESSION_ADDRESS, address)
  write(localStorage, CREDENTIAL_ID, credentialId)
  write(localStorage, REMEMBERED_ADDRESS, address)
}

/**
 * End the session. The credential id survives by default: forgetting it would
 * strand the reader's funded wallet behind a passkey they can no longer be
 * offered, and a passkey is not a secret worth clearing on sign-out. `forget`
 * is for the reader who explicitly wants this device to stop offering it.
 */
export function endPasskeySession(forget = false): void {
  write(sessionStorage, SESSION_ADDRESS, null)
  if (forget) {
    write(localStorage, CREDENTIAL_ID, null)
    write(localStorage, REMEMBERED_ADDRESS, null)
  }
}
