import { describe, expect, it } from 'vitest'
import {
  passkeyCapability,
  passkeyLabel,
  passkeyOffered,
  type WebAuthnWindow,
} from './passkeySupport'

function win(probe?: (() => Promise<boolean>) | 'absent'): WebAuthnWindow {
  if (probe === 'absent') return { PublicKeyCredential: {} }
  if (!probe) return {}
  return { PublicKeyCredential: { isUserVerifyingPlatformAuthenticatorAvailable: probe } }
}

describe('passkeyCapability', () => {
  it('reports a built-in authenticator as platform', async () => {
    expect(await passkeyCapability(win(() => Promise.resolve(true)))).toBe('platform')
  })

  it('falls back to cross-device when the device has no built-in authenticator', async () => {
    expect(await passkeyCapability(win(() => Promise.resolve(false)))).toBe('cross-device')
  })

  it('reports none when WebAuthn is absent', async () => {
    expect(await passkeyCapability(win())).toBe('none')
  })

  it('reports none when WebAuthn exists without the probe', async () => {
    expect(await passkeyCapability(win('absent'))).toBe('none')
  })

  /*
   * A probe that throws has told us about the browser, not the device. Treating
   * it as `none` would hide the control from someone whose authenticator works.
   */
  it('assumes the weaker capability rather than hiding the control', async () => {
    expect(await passkeyCapability(win(() => Promise.reject(new Error('blocked'))))).toBe(
      'cross-device',
    )
  })
})

describe('copy', () => {
  it('names the authenticator only when the device has a built-in one', () => {
    expect(passkeyLabel('platform')).toMatch(/Face ID/)
    expect(passkeyLabel('cross-device')).toBe('Continue with a passkey')
  })

  it('offers the entry point unless WebAuthn is missing entirely', () => {
    expect(passkeyOffered('platform')).toBe(true)
    expect(passkeyOffered('cross-device')).toBe(true)
    expect(passkeyOffered('none')).toBe(false)
  })
})
