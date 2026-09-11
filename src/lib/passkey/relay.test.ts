import { describe, expect, it } from 'vitest'
import { decodeAssembled, relayAssembled, relayEnvelope, type AssembledLike } from './relay'

const xdrOf = (value: string) => ({ toXDR: () => value })

function assembled(func?: string, auth: string[] = []): AssembledLike {
  return {
    built: {
      operations: [{ ...(func ? { func: xdrOf(func) } : {}), auth: auth.map(xdrOf) }],
    },
  }
}

function respondWith(status: number, body: unknown): typeof fetch {
  return (() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    } as Response)) as unknown as typeof fetch
}

describe('decodeAssembled', () => {
  it('pulls the host function and every signed auth entry out', () => {
    expect(decodeAssembled(assembled('FUNC', ['A', 'B']))).toEqual({
      func: 'FUNC',
      auth: ['A', 'B'],
    })
  })

  it('reads a call that needs no authorization as an empty entry list', () => {
    expect(decodeAssembled(assembled('FUNC'))).toEqual({ func: 'FUNC', auth: [] })
  })

  it('reports an unprepared transaction instead of throwing', () => {
    expect(decodeAssembled({})).toMatchObject({ code: 'passkey_not_prepared' })
    expect(decodeAssembled(assembled())).toMatchObject({ code: 'passkey_not_prepared' })
  })
})

describe('relayAssembled', () => {
  it('returns the submitted hash', async () => {
    const result = await relayAssembled(respondWith(200, { hash: 'abc' }), assembled('FUNC'))
    expect(result).toEqual({ hash: 'abc' })
  })

  /*
   * A refusal has to survive as itself. It means the relay is not cleared to
   * sponsor this call, so the one thing the reader must not be invited to do
   * is try again.
   */
  it('keeps a refusal distinguishable from a failure', async () => {
    const refused = await relayAssembled(respondWith(403, { error: 'no' }), assembled('FUNC'))
    expect(refused).toMatchObject({ code: 'passkey_not_sponsored' })
    expect((refused as { message: string }).message).toMatch(/will not help/i)
  })

  it('names an unconfigured relay separately from a broken one', async () => {
    expect(await relayAssembled(respondWith(503, {}), assembled('FUNC'))).toMatchObject({
      code: 'passkey_relay_unconfigured',
    })
    expect(await relayAssembled(respondWith(502, {}), assembled('FUNC'))).toMatchObject({
      code: 'passkey_relay_failed',
    })
  })

  it('treats a success with no hash as a failure', async () => {
    expect(await relayAssembled(respondWith(200, {}), assembled('FUNC'))).toMatchObject({
      code: 'passkey_relay_failed',
    })
  })

  it('reports an unreachable relay as a network condition', async () => {
    const offline = (() => Promise.reject(new Error('Failed to fetch'))) as unknown as typeof fetch
    expect(await relayAssembled(offline, assembled('FUNC'))).toMatchObject({
      code: 'network_error',
    })
  })

  it('never posts an unprepared transaction', async () => {
    let called = false
    const spy = (() => {
      called = true
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) } as Response)
    }) as unknown as typeof fetch
    expect(await relayAssembled(spy, {})).toMatchObject({ code: 'passkey_not_prepared' })
    expect(called).toBe(false)
  })
})

describe('relayEnvelope', () => {
  it('submits a fully signed envelope and returns its hash', async () => {
    expect(await relayEnvelope(respondWith(200, { hash: 'deploy' }), 'ENVELOPE')).toEqual({
      hash: 'deploy',
    })
  })
})
