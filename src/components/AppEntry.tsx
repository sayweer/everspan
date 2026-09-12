/**
 * Getting into the app from the marketing page.
 *
 * The app is gated, so a control that simply links to `/app` would bounce a
 * reader without a session straight back here. These two pieces keep that from
 * happening: the control asks for a session when there is none, and the hook
 * carries the reader in the moment one arrives.
 */
import { useState, type ReactElement, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useDisclosure } from '../hooks/useDisclosure'
import { BottomSheet } from './BottomSheet'
import { PasskeySignIn } from './PasskeySignIn'
import { buttonClasses } from '../lib/buttonStyles'
import { isAppError, type AppError } from '../types'

interface EnterAppProps {
  children: ReactNode
  className: string
}

/**
 * The primary call to action. A link once there is a session, and a request
 * for one before that — the same control either way, so the page does not have
 * to explain which state the reader is in.
 */
export function EnterApp({ children, className }: EnterAppProps): ReactElement {
  const { isConnected, connect } = useWallet()
  const sheet = useDisclosure()
  const [error, setError] = useState<AppError | null>(null)
  const [busy, setBusy] = useState(false)

  if (isConnected) {
    return (
      <Link to="/app" className={className}>
        {children}
      </Link>
    )
  }

  async function connectWallet(): Promise<void> {
    setBusy(true)
    setError(null)
    const result = await connect()
    setBusy(false)
    if (isAppError(result)) setError(result)
    // Success needs nothing here: `useEnterOnConnect` takes it from the
    // session change, which is the same signal a passkey sign-in produces.
  }

  return (
    <>
      <button
        type="button"
        onClick={sheet.show}
        aria-haspopup="dialog"
        aria-expanded={sheet.open}
        className={className}
      >
        {children}
      </button>

      <BottomSheet open={sheet.open} onClose={sheet.hide} title="Enter Everspan">
        <div className="space-y-5 pb-2">
          <p className="text-sm leading-relaxed text-neutral-400">
            Everspan needs an account to sign with — every action on chain is authorized by you,
            never by us.
          </p>

          {/* PASSKEY-ENTRY: renders nothing when the feature is off, leaving
              the wallet path alone. See docs/passkey.md. */}
          <PasskeySignIn />

          <div className="border-t border-hairline pt-5">
            <button
              type="button"
              onClick={() => {
                void connectWallet()
              }}
              disabled={busy}
              aria-busy={busy}
              className={buttonClasses({ variant: 'secondary', size: 'lg', full: true })}
            >
              {busy ? 'Opening your wallet…' : 'Connect a wallet'}
            </button>
            <p className="mt-2 text-center text-xs text-neutral-500">
              Freighter, xBull, Albedo and others.
            </p>
            {error && (
              <p role="alert" className="mt-3 text-center text-xs text-negative-300">
                {error.message}
              </p>
            )}
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
