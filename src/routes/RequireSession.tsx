/**
 * The gate in front of the app.
 *
 * Everspan's product surface is for people who can act on it, and every action
 * needs an account to authorize it. Without one the panels are a tour of
 * controls that cannot be pressed — so a reader with no session is sent back
 * to the page that exists to give them one, rather than being let in to find
 * out.
 *
 * The waiting state is the part that matters. A persisted wallet comes back
 * asynchronously, so `isConnected` is false for the first moments of every
 * load whether or not anyone is connected. Acting on that directly would throw
 * a returning reader out on every reload and tell them their wallet had
 * dropped, which is both wrong and alarming.
 */
import { Navigate, useLocation } from 'react-router-dom'
import type { ReactElement, ReactNode } from 'react'
import { useWallet } from '../context/WalletContext'

/** Where the reader was headed, carried so the entry can return them to it. */
export interface EntryIntent {
  intended?: string
}

export function RequireSession({ children }: { children: ReactNode }): ReactElement {
  const { isConnected, hasRestored } = useWallet()
  const location = useLocation()

  if (isConnected) return <>{children}</>

  if (!hasRestored) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[100svh] items-center justify-center px-6"
      >
        {/* Deliberately quiet. This resolves in a moment for almost everyone,
            and a spinner that announces itself makes a normal load feel like a
            problem. */}
        <p className="text-sm text-neutral-500">Checking your session…</p>
      </div>
    )
  }

  const intent: EntryIntent = { intended: `${location.pathname}${location.search}` }
  return <Navigate to="/" replace state={intent} />
}
