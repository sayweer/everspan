/**
 * The wallet-free way in.
 *
 * PASSKEY-ENTRY. Testnet only, and removed with the rest of the feature — see
 * `docs/passkey.md`. It renders nothing at all unless the kill switch is armed
 * and this browser can actually run a ceremony, so a build with the feature
 * switched off shows exactly what it showed before.
 */
import { useEffect, useState, type ReactElement } from 'react'
import { useWallet } from '../context/WalletContext'
import { passkeyEnabled } from '../lib/passkey/enabled'
import { passkeyCapability, passkeyLabel, passkeyOffered } from '../lib/passkey/support'
import type { PasskeyCapability } from '../lib/passkey/support'
import { rememberedWallet } from '../lib/passkey/session'
import { buttonClasses } from '../lib/buttonStyles'
import { isAppError, type AppError } from '../types'

export function PasskeySignIn(): ReactElement | null {
  const { adoptPasskey } = useWallet()
  const [capability, setCapability] = useState<PasskeyCapability>('none')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const returning = rememberedWallet() !== null

  useEffect(() => {
    if (!passkeyEnabled()) return
    void passkeyCapability(window).then(setCapability)
  }, [])

  if (!passkeyEnabled() || !passkeyOffered(capability)) return null

  async function signIn(): Promise<void> {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const { createPasskeyWallet, reopenPasskeyWallet } = await import('../lib/passkey/connect')
      const result = returning ? await reopenPasskeyWallet() : await createPasskeyWallet()
      if (isAppError(result)) {
        setError(result)
        return
      }
      if (result.fundingError) {
        // The wallet is theirs either way — say what is missing, then let them in.
        setNotice(`${result.fundingError.message} Your wallet is ready; funds can follow.`)
      }
      adoptPasskey(result.address)
    } finally {
      setBusy(false)
    }
  }

  const label = returning ? 'Continue where you left off' : passkeyLabel(capability)

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => {
          void signIn()
        }}
        disabled={busy}
        aria-busy={busy}
        className={buttonClasses({ variant: 'positive', size: 'lg' })}
      >
        {busy ? 'Setting up your wallet…' : label}
      </button>

      <p className="max-w-sm text-center text-xs leading-relaxed text-neutral-500">
        No extension, no seed phrase, no XLM to buy first. Everspan creates a Testnet wallet on
        this device and funds it for you.{' '}
        {/* Said plainly rather than discovered later: there is no recovery, and
            on Testnet that is a fair trade the reader should get to make. */}
        <strong className="font-medium text-neutral-400">
          It lives on this device only — lose the device and the wallet goes with it.
        </strong>{' '}
        Testnet funds have no value.
      </p>

      {notice && (
        <p role="status" className="max-w-sm text-center text-xs text-warning-300">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="max-w-sm text-center text-xs text-negative-300">
          {error.message}
        </p>
      )}
    </div>
  )
}
