/**
 * Whether this browser can offer a passkey, and what to call it.
 *
 * We never choose the authenticator. Tapping the control hands off to the OS,
 * which offers whatever that device actually has — Face ID, Touch ID, Windows
 * Hello, an Android screen lock, a phone over QR, a password manager, a
 * security key. There is deliberately no mobile-vs-desktop branch here: the
 * only questions are whether anything is available at all, and whether it is
 * built into this device.
 *
 * The probe is a convenience for choosing copy, not a gate. Browsers report it
 * wrong often enough that refusing to show the control on a negative answer
 * would lock out people whose device works fine — so WebAuthn itself stays the
 * final arbiter, at the moment the reader actually taps.
 */

export type PasskeyCapability = 'platform' | 'cross-device' | 'none'

/** The slice of `window` this module reads, so a test needs no DOM. */
export interface WebAuthnWindow {
  PublicKeyCredential?: {
    isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>
  }
}

/**
 * `platform` — a built-in authenticator (fingerprint, face, device PIN).
 * `cross-device` — no built-in one, but WebAuthn can still pair a phone or a
 * password manager. `none` — WebAuthn is absent; only wallet connect remains.
 */
export async function passkeyCapability(win: WebAuthnWindow): Promise<PasskeyCapability> {
  const probe = win.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable
  if (typeof probe !== 'function') return 'none'
  try {
    return (await probe.call(win.PublicKeyCredential)) ? 'platform' : 'cross-device'
  } catch {
    // A probe that throws tells us nothing about the device, only about the
    // browser's implementation of the probe. Assume the weaker capability
    // rather than hiding the control.
    return 'cross-device'
  }
}

/**
 * What the control should say. A named authenticator is worth more than a
 * generic one — "Face ID" is a thing the reader has used today, "a passkey" is
 * a word most people have never had to learn — but we can only name it when
 * the device has a built-in one, and even then we do not know which.
 */
export function passkeyLabel(capability: PasskeyCapability): string {
  return capability === 'platform' ? 'Continue with Face ID or Touch ID' : 'Continue with a passkey'
}

/** Whether to render the passkey entry point at all. */
export function passkeyOffered(capability: PasskeyCapability): boolean {
  return capability !== 'none'
}
