import { describe, expect, it } from 'vitest'
import { Networks } from '@stellar/stellar-sdk'
import { passkeyEnabledFor } from './enabled'

const HASH = 'a'.repeat(64)

describe('passkeyEnabledFor', () => {
  it('arms on Testnet with a wallet wasm hash configured', () => {
    expect(passkeyEnabledFor({ networkPassphrase: Networks.TESTNET, walletWasmHash: HASH })).toBe(
      true,
    )
  })

  /*
   * Clearing the hash is the kill switch: it takes the entry point out
   * everywhere without a rebuild, which is the whole point of making
   * configuration the flag rather than adding a second boolean to forget.
   */
  it('stays off when no wallet wasm hash is configured', () => {
    expect(passkeyEnabledFor({ networkPassphrase: Networks.TESTNET, walletWasmHash: '' })).toBe(
      false,
    )
    expect(passkeyEnabledFor({ networkPassphrase: Networks.TESTNET, walletWasmHash: '   ' })).toBe(
      false,
    )
  })

  /*
   * The guard that makes this impossible to ship to mainnet by accident. A
   * sponsored, recovery-less, server-funded wallet is a Testnet-feedback tool;
   * on mainnet it is the wrong shape whatever a dashboard still says.
   */
  it('refuses to arm on any network but Testnet, even fully configured', () => {
    expect(passkeyEnabledFor({ networkPassphrase: Networks.PUBLIC, walletWasmHash: HASH })).toBe(
      false,
    )
    expect(passkeyEnabledFor({ networkPassphrase: Networks.FUTURENET, walletWasmHash: HASH })).toBe(
      false,
    )
    expect(passkeyEnabledFor({ networkPassphrase: 'Some Other Network', walletWasmHash: HASH })).toBe(
      false,
    )
  })
})
