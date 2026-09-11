/* eslint-disable react-refresh/only-export-components --
   The provider and its useWallet hook are intentionally colocated in this module;
   the Fast Refresh boundary tradeoff is acceptable for a stable context. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { config } from '../config'
import {
  disconnectWallet,
  getWalletNetwork,
  onWalletAddressChange,
  openWalletPicker,
} from '../lib/wallet'
import { isAppError, type AppError, type WalletState } from '../types'
// PASSKEY-ENTRY: the wallet-free entry point. See docs/passkey.md.
import { passkeyAddress } from '../lib/passkey/session'

const INITIAL_STATE: WalletState = {
  status: 'disconnected',
  address: null,
  network: null,
  networkPassphrase: null,
}

/** Wallet state plus actions and derived flags exposed to the app. */
export interface WalletContextValue extends WalletState {
  /** True when an account is connected. */
  isConnected: boolean
  /** True when connected but confirmed to be on a non-Testnet network (blocks sending). */
  isWrongNetwork: boolean
  /** True when connected but the wallet doesn't report its network (e.g. Albedo) — a
   *  soft warning, not a block, since the tx would fail at the wallet if truly wrong. */
  networkUnknown: boolean
  /**
   * False until a persisted session has had its chance to come back.
   *
   * The kit restores an address asynchronously, so `isConnected` is false for
   * the first moments of every load whether or not a wallet is connected.
   * Anything that *acts* on being disconnected — a route guard above all — has
   * to wait for this, or it throws a returning reader out on every reload and
   * reports it to them as a dropped connection.
   */
  hasRestored: boolean
  /** Open the multi-wallet picker. Resolves to an AppError on failure, or null on success. */
  connect: () => Promise<AppError | null>
  /** Clear the wallet connection (kit exposes no server-side disconnect). */
  disconnect: () => void
  /*
   * PASSKEY-ENTRY. True when this session is a passkey smart wallet rather
   * than a connected wallet. Components should not branch on this — the
   * address behaves the same either way — but the header needs it to label
   * the session honestly, and the network check below to skip a question a
   * contract cannot answer.
   */
  isPasskey: boolean
  /** PASSKEY-ENTRY. Adopt a passkey wallet as the session. */
  adoptPasskey: (address: string) => void
}

const WalletContext = createContext<WalletContextValue | null>(null)

/** Provides wallet connection state and actions to the tree. */
export function WalletProvider({ children }: { children: ReactNode }): ReactElement {
  const [state, setState] = useState<WalletState>(INITIAL_STATE)
  // PASSKEY-ENTRY: a second source of address, merged below. Read
  // synchronously, so a passkey session needs no restore window at all.
  const [passkey, setPasskey] = useState<string | null>(() => passkeyAddress())
  const [walletRestored, setWalletRestored] = useState(false)
  // Whether the network read has resolved for the current address (so the
  // "network unknown" warning doesn't flicker during the async fetch).
  const [networkChecked, setNetworkChecked] = useState(false)
  // Tracks which address the most recent network check belongs to, so a slow
  // check for a since-replaced address can't mark the *new* address's check
  // as done — that would flip `networkUnknown` true for a beat before the
  // new address's own check actually resolves.
  const latestAddressRef = useRef<string | null>(null)

  // The kit fires this immediately with its persisted address (restoring a
  // session across reloads with no popup), then again on every
  // connect/disconnect/account switch — this is the single source of truth
  // for `address`.
  useEffect(() => {
    /*
     * The kit is expected to fire immediately with whatever it persisted, but
     * a kit that stays silent would leave the guard waiting forever. The
     * timeout is the floor: after it, "no address arrived" is taken as the
     * answer rather than as a question still open.
     */
    const settled = window.setTimeout(() => {
      setWalletRestored(true)
    }, 1500)

    const unsubscribe = onWalletAddressChange((address) => {
      latestAddressRef.current = address
      setWalletRestored(true)
      if (!address) {
        setState(INITIAL_STATE)
        setNetworkChecked(false)
        return
      }
      setNetworkChecked(false)
      setState((prev) => ({
        ...prev,
        status: 'connected',
        address,
        network: null,
        networkPassphrase: null,
      }))
      void getWalletNetwork().then((net) => {
        setState((prev) =>
          prev.address === address
            ? {
                ...prev,
                network: net?.network ?? null,
                networkPassphrase: net?.networkPassphrase ?? null,
              }
            : prev,
        )
        if (latestAddressRef.current === address) setNetworkChecked(true)
      })
    })
    return () => {
      window.clearTimeout(settled)
      unsubscribe()
    }
  }, [])

  const connect = useCallback(async (): Promise<AppError | null> => {
    setState((prev) => ({ ...prev, status: 'connecting' }))
    const result = await openWalletPicker()
    if (isAppError(result)) {
      // Success is applied by the onWalletAddressChange subscription above;
      // on failure, only reset if we're still mid-connect (no address landed).
      setState((prev) => (prev.status === 'connecting' ? INITIAL_STATE : prev))
      return result
    }
    return null
  }, [])

  const disconnect = useCallback((): void => {
    disconnectWallet()
    setState(INITIAL_STATE)
    // PASSKEY-ENTRY
    if (passkeyAddress() !== null) {
      setPasskey(null)
      void import('../lib/passkey/connect').then((m) => m.disconnectPasskey())
    }
  }, [])

  // PASSKEY-ENTRY
  const adoptPasskey = useCallback((address: string): void => {
    setPasskey(address)
  }, [])

  const value = useMemo<WalletContextValue>(() => {
    /*
     * PASSKEY-ENTRY. A passkey session wins when both exist: it is the one the
     * reader chose in this tab, and it is deployed on Testnet by construction,
     * so the network questions below have answers without asking a contract
     * what network it is on — which it cannot tell us.
     */
    if (passkey !== null) {
      return {
        status: 'connected',
        address: passkey,
        network: 'TESTNET',
        networkPassphrase: config.networkPassphrase,
        isConnected: true,
        isWrongNetwork: false,
        networkUnknown: false,
        connect,
        disconnect,
        isPasskey: true,
        adoptPasskey,
        hasRestored: true,
      }
    }

    const isConnected = state.status === 'connected' && state.address !== null
    return {
      ...state,
      isConnected,
      isWrongNetwork:
        isConnected &&
        state.networkPassphrase !== null &&
        state.networkPassphrase !== config.networkPassphrase,
      networkUnknown: isConnected && networkChecked && state.networkPassphrase === null,
      connect,
      disconnect,
      isPasskey: false,
      adoptPasskey,
      hasRestored: walletRestored,
    }
  }, [state, networkChecked, connect, disconnect, passkey, adoptPasskey, walletRestored])

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

/** Access wallet state + actions. Throws if used outside a WalletProvider. */
export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext)
  if (ctx === null) {
    throw new Error('useWallet must be used within a <WalletProvider>.')
  }
  return ctx
}
