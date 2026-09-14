import { Api } from '@stellar/stellar-sdk/rpc'
import { describe, expect, it } from 'vitest'
import { awaitConfirmation, interpretTransactionStatus } from './transactionStatus'

describe('transaction finality status', () => {
  it.each([
    [Api.GetTransactionStatus.SUCCESS, 'success'],
    [Api.GetTransactionStatus.FAILED, 'failed'],
    [Api.GetTransactionStatus.NOT_FOUND, 'not_found'],
  ])('maps %s without unlocking an ambiguous state', (status, expected) => {
    expect(interpretTransactionStatus(status)).toBe(expected)
  })

  it('keeps unknown RPC states fail-closed', () => {
    expect(interpretTransactionStatus('SOMETHING_NEW')).toMatchObject({
      code: 'transaction_status_unknown',
    })
  })
})

describe('awaitConfirmation', () => {
  const fast = { delayMs: 0, attempts: 4 }

  it('resolves once the transaction succeeds after a few misses', async () => {
    const answers = ['not_found', 'not_found', 'success'] as const
    let call = 0
    const check = () => Promise.resolve(answers[call++])
    expect(await awaitConfirmation('h', { ...fast, check })).toBeNull()
    expect(call).toBe(3)
  })

  it('reports a failed transaction as failed, not as success', async () => {
    const check = () => Promise.resolve('failed' as const)
    expect(await awaitConfirmation('h', { ...fast, check })).toMatchObject({
      code: 'transaction_failed_on_chain',
    })
  })

  /* A relay can hand back a hash for a transaction that never lands. */
  it('gives up as unconfirmed rather than claiming success', async () => {
    const check = () => Promise.resolve({ code: 'transaction_status_unavailable', message: '' })
    expect(await awaitConfirmation('h', { ...fast, check })).toMatchObject({
      code: 'transaction_unconfirmed',
    })
  })
})
