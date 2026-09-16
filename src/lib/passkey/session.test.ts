import { afterEach, describe, expect, it } from 'vitest'
import {
  endPasskeySession,
  passkeyAddress,
  rememberedWallet,
  startPasskeySession,
  storedCredentialId,
} from './session'

const originalSessionStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

function restoreGlobal(name: 'sessionStorage' | 'localStorage', descriptor?: PropertyDescriptor) {
  if (descriptor) Object.defineProperty(globalThis, name, descriptor)
  else Reflect.deleteProperty(globalThis, name)
}

afterEach(() => {
  restoreGlobal('sessionStorage', originalSessionStorage)
  restoreGlobal('localStorage', originalLocalStorage)
})

describe('passkey session storage', () => {
  it('stays usable when Web Storage globals are unavailable', () => {
    Reflect.deleteProperty(globalThis, 'sessionStorage')
    Reflect.deleteProperty(globalThis, 'localStorage')

    expect(passkeyAddress()).toBeNull()
    expect(storedCredentialId()).toBeNull()
    expect(rememberedWallet()).toBeNull()
    expect(() => startPasskeySession('CTEST', 'credential')).not.toThrow()
    expect(() => endPasskeySession(true)).not.toThrow()
  })

  it('stays usable when privacy controls reject access to storage', () => {
    const blocked = {
      configurable: true,
      get: () => {
        throw new DOMException('Storage access denied', 'SecurityError')
      },
    }
    Object.defineProperty(globalThis, 'sessionStorage', blocked)
    Object.defineProperty(globalThis, 'localStorage', blocked)

    expect(passkeyAddress()).toBeNull()
    expect(rememberedWallet()).toBeNull()
    expect(() => startPasskeySession('CTEST', 'credential')).not.toThrow()
    expect(() => endPasskeySession(true)).not.toThrow()
  })
})
