import { describe, expect, it, vi } from 'vitest'
import { openAfterDialogCloses } from './walletEntry'

describe('openAfterDialogCloses', () => {
  it('removes the native dialog before opening the wallet picker', async () => {
    const order: string[] = []
    const result = await openAfterDialogCloses(
      () => order.push('close'),
      async () => {
        order.push('open')
        return 'connected'
      },
      async () => {
        order.push('settled')
      },
    )

    expect(order).toEqual(['close', 'settled', 'open'])
    expect(result).toBe('connected')
  })

  it('does not open the picker when the dialog could not finish closing', async () => {
    const open = vi.fn(async () => 'connected')

    await expect(
      openAfterDialogCloses(
        vi.fn(),
        open,
        () => Promise.reject(new Error('dialog did not close')),
      ),
    ).rejects.toThrow('dialog did not close')
    expect(open).not.toHaveBeenCalled()
  })
})
