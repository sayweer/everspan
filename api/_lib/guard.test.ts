import { describe, expect, it } from 'vitest'
import { Address, Contract, StrKey, xdr } from '@stellar/stellar-sdk'
import { admits, classifyHostFunction, isRelayAllowed, parseList } from './guard'

const MARKET = 'CDN42W36GJ2AGPWGDMEL2BUEKCGCVCQ4GRLFXUBPTQUDIEDWQQHZG3TR'
/* Derived rather than typed out: a hand-written id fails the strkey checksum,
   and the guard would then refuse it for the wrong reason. */
const UNLISTED = StrKey.encodeContract(Buffer.alloc(32, 1))
const PT_WASM = 'b'.repeat(64)

/** A real invoke host function, built the way the SDK builds one. */
function invokeXdr(contractId: string): string {
  const op = new Contract(contractId).call('balance', new Address(contractId).toScVal())
  return op.body().invokeHostFunctionOp().hostFunction().toXDR('base64')
}

function deployXdr(wasmHash: string): string {
  const fn = xdr.HostFunction.hostFunctionTypeCreateContractV2(
    new xdr.CreateContractArgsV2({
      contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAddress(
        new xdr.ContractIdPreimageFromAddress({
          address: new Address(MARKET).toScAddress(),
          salt: Buffer.alloc(32),
        }),
      ),
      executable: xdr.ContractExecutable.contractExecutableWasm(Buffer.from(wasmHash, 'hex')),
      constructorArgs: [],
    }),
  )
  return fn.toXDR('base64')
}

const neverRead = () => Promise.resolve(null)

describe('classifyHostFunction', () => {
  it('reads the target of a contract call', () => {
    expect(classifyHostFunction(invokeXdr(MARKET))).toEqual({ kind: 'invoke', contractId: MARKET })
  })

  it('reads the code of a deployment', () => {
    expect(classifyHostFunction(deployXdr(PT_WASM))).toEqual({ kind: 'deploy', wasmHash: PT_WASM })
  })

  /* Anything unparseable is refused rather than guessed at. */
  it('refuses to classify malformed input', () => {
    expect(classifyHostFunction('not base64 xdr')).toEqual({ kind: 'other' })
    expect(classifyHostFunction('')).toEqual({ kind: 'other' })
  })
})

describe('isRelayAllowed', () => {
  const cfg = { contracts: [MARKET], wasmHashes: [PT_WASM], readWasmHash: neverRead }

  it('admits a known deployment by address', async () => {
    expect(await isRelayAllowed(MARKET, cfg)).toBe(true)
  })

  /*
   * PT and YT are factory-deployed per maturity, so their addresses cannot be
   * listed ahead of time. Admitting them by the code they run is the only way
   * to sponsor them without opening the relay to every contract on the network.
   */
  it('admits an unlisted address running allowed code', async () => {
    expect(
      await isRelayAllowed(UNLISTED, { ...cfg, readWasmHash: () => Promise.resolve(PT_WASM) }),
    ).toBe(true)
  })

  it('matches a wasm hash regardless of case', async () => {
    expect(
      await isRelayAllowed(UNLISTED, {
        ...cfg,
        readWasmHash: () => Promise.resolve(PT_WASM.toUpperCase()),
      }),
    ).toBe(true)
  })

  it('refuses an unlisted address running unknown code', async () => {
    expect(
      await isRelayAllowed(UNLISTED, { ...cfg, readWasmHash: () => Promise.resolve('c'.repeat(64)) }),
    ).toBe(false)
  })

  it('refuses anything that is not a contract id', async () => {
    for (const bad of ['', 'GABC', MARKET.slice(0, -1), `${MARKET}X`, 'C'.repeat(56)]) {
      expect(await isRelayAllowed(bad, cfg)).toBe(false)
    }
  })

  /*
   * The guard fails closed on an RPC outage. Sponsoring a call because we
   * could not check it is the one failure mode that costs real money.
   */
  it('refuses when the code cannot be read', async () => {
    expect(
      await isRelayAllowed(UNLISTED, {
        ...cfg,
        readWasmHash: () => Promise.reject(new Error('rpc down')),
      }),
    ).toBe(false)
    expect(await isRelayAllowed(UNLISTED, cfg)).toBe(false)
  })
})

describe('admits', () => {
  const cfg = { contracts: [MARKET], wasmHashes: [PT_WASM], readWasmHash: neverRead }

  it('passes an allowed call and an allowed deployment', async () => {
    expect(await admits(invokeXdr(MARKET), cfg)).toBe(true)
    expect(await admits(deployXdr(PT_WASM), cfg)).toBe(true)
  })

  it('refuses a deployment of code we do not recognise', async () => {
    expect(await admits(deployXdr('d'.repeat(64)), cfg)).toBe(false)
  })

  it('refuses a call to a contract we never listed', async () => {
    expect(await admits(invokeXdr(UNLISTED), cfg)).toBe(false)
  })

  it('refuses anything it cannot read', async () => {
    expect(await admits('garbage', cfg)).toBe(false)
  })
})

describe('parseList', () => {
  it('cleans a comma-separated environment value', () => {
    expect(parseList(' a , b ,, c ')).toEqual(['a', 'b', 'c'])
    expect(parseList(undefined)).toEqual([])
    expect(parseList('')).toEqual([])
  })
})
