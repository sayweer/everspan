/**
 * Carry the reader into the app when a session arrives.
 *
 * The app is gated, so a control on the marketing page cannot simply link to
 * it — the reader has to be taken there once they have something to sign with.
 *
 * Only a session that arrives *during this visit* counts. Someone already
 * connected who opens the marketing page came here to read it, and throwing
 * them into the app would make the page unreadable to exactly the people who
 * use it most.
 */
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import type { EntryIntent } from '../routes/RequireSession'

export function useEnterOnConnect(): void {
  const { isConnected } = useWallet()
  const navigate = useNavigate()
  const location = useLocation()
  const wasConnected = useRef(isConnected)

  useEffect(() => {
    if (isConnected && !wasConnected.current) {
      const intent = location.state as EntryIntent | null
      navigate(intent?.intended ?? '/app', { replace: true })
    }
    wasConnected.current = isConnected
  }, [isConnected, navigate, location.state])
}
