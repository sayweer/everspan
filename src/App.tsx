import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useWallet } from './context/WalletContext'
import { useTransactionSafety } from './context/TransactionSafetyContext'
import { useSurface } from './hooks/useSurface'
import { useDocumentTitle } from './hooks/useDocumentTitle'
import { useBalance } from './hooks/useBalance'
import { useHiddenAmounts } from './hooks/useHiddenAmounts'
import { usePortfolio } from './hooks/usePortfolio'
import { usePools } from './hooks/usePools'
import { useHoldings } from './hooks/useHoldings'
import { useLiveRate } from './hooks/useLiveRate'
import { useProtocolEvents } from './hooks/useProtocolEvents'
import { isContractsConfigured, markets, type MarketKey } from './config'
import { activeMarket, setActiveMarket } from './lib/market'
import { NetworkBanner } from './components/NetworkBanner'
import { BalanceCard } from './components/BalanceCard'
import { BalanceHero } from './components/BalanceHero'
import { RateTicker } from './components/RateTicker'
import { WalletBar } from './components/WalletBar'
import { BrandMark } from './components/BrandMark'
import { BottomNav, SideNav, type TabId } from './components/SideNav'
import { PositionsPanel, type PositionsSegment } from './components/PositionsPanel'
import { ActivityPanel, type ActivityScope } from './components/ActivityPanel'
import { AccountPanel } from './components/AccountPanel'
import { ConnectPrompt } from './components/ConnectPrompt'
import { HomePanel, type EarnStrategy } from './components/HomePanel'
import { ConnectionBanner } from './components/ConnectionBanner'
import { AppHeader } from './components/AppHeader'
import { AlertTriangleIcon } from './components/icons'
import { DataUnavailable } from './components/DataUnavailable'

function App(): ReactElement {
  useSurface('app')
  useDocumentTitle('App — Everspan')
  const [marketKey, setMarketKey] = useState<MarketKey>(markets[0].key)
  const { address } = useWallet()
  const { resolutionVersion, dataVersion, trackedTransaction } = useTransactionSafety()
  const configured = isContractsConfigured()
  const mountedScope = useRef(false)

  useEffect(() => {
    if (!mountedScope.current) {
      mountedScope.current = true
      return
    }
    focusActivePanel()
  }, [address, resolutionVersion])

  function switchMarket(key: MarketKey): void {
    if (trackedTransaction?.state === 'in_flight') return
    // The contract services resolve addresses from module state, so point them
    // at the new deployment before the remount below refetches everything.
    setActiveMarket(key)
    setMarketKey(key)
    window.requestAnimationFrame(() => {
      // The desktop radiogroup stays in the DOM below `lg`, just hidden, so
      // finding it is not the same as being able to focus it — a `display:none`
      // element accepts the call and does nothing, which is how focus ended up
      // on `<body>`. `offsetParent` is the cheap test for painted-or-not. On a
      // phone the radio the reader pressed lived in a sheet that has since
      // closed, so the chip that opened it is the honest destination.
      const chosen = document.getElementById(`market-${key}`)
      const target = chosen?.offsetParent ? chosen : document.getElementById('market-trigger')
      target?.focus()
    })
  }

  // Two mobile measurements live on the shell element. `svh` is the viewport
  // that is actually on screen, where `vh` is the taller one the browser shows
  // with its chrome hidden — measured against `vh` the bottom nav starts below
  // the fold. The safe-area insets sit here rather than on each container
  // inside, so the banners, the header and the panels clear the notch together:
  // 0 in portrait, and in landscape the reason the first character of a line
  // is not under the camera.
  return (
    <div className="flex min-h-[100svh] flex-col pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)]">
      {/* Same escape hatch the marketing route offers: the rail, the market
          switcher and the wallet control sit ahead of the panel in tab order. */}
      <a
        href="#app-main"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-full bg-accent-500 px-4 py-3 text-sm font-medium text-onAccent transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-accent-300 focus:ring-offset-2 focus:ring-offset-neutral-950 motion-reduce:transition-none"
      >
        Skip to main content
      </a>
      <NetworkBanner />
      <ConnectionBanner />
      <span role="status" aria-live="polite" className="sr-only">
        {address
          ? `Wallet connected to ${marketKey}. Account ${address.slice(0, 4)}…${address.slice(-4)}.`
          : 'Wallet disconnected.'}
      </span>

      {!configured && (
        <div role="alert" className="border-b border-warning-500/30 bg-warning-500/10">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 text-sm text-warning-100 lg:px-6">
            <AlertTriangleIcon className="h-5 w-5 shrink-0 text-warning-400" />
            <p>
              Contract IDs are not configured. Set the <code>VITE_*_CONTRACT_ID</code> variables to
              point at a deployment.
            </p>
          </div>
        </div>
      )}

      {/* Each market is an independent deployment — its own vault, Market,
          pools and balances. Remounting on a switch is what guarantees that
          no read, position or form value survives from the previous one. */}
      <MarketContent
        key={`${marketKey}:${address ?? 'disconnected'}:${resolutionVersion}`}
        marketKey={marketKey}
        dataVersion={dataVersion}
        onSwitchMarket={switchMarket}
      />
    </div>
  )
}

interface MarketContentProps {
  marketKey: MarketKey
  dataVersion: number
  onSwitchMarket: (key: MarketKey) => void
}

/** Everything that belongs to one market. Mounted fresh per market. */
function MarketContent({
  marketKey,
  dataVersion,
  onSwitchMarket,
}: MarketContentProps): ReactElement {
  const { isConnected, address, isWrongNetwork } = useWallet()
  const balance = useBalance(address)
  const [amountsHidden, toggleAmountsHidden] = useHiddenAmounts()
  const { portfolio, loading, error, refresh, refreshSilent } = usePortfolio(address)
  const pools = usePools(address, portfolio.maturities)
  const liveRate = useLiveRate(portfolio.rateInfo)
  const holdings = useHoldings(portfolio, pools.pools, liveRate)
  const refreshPools = pools.refresh
  const refreshBalance = balance.refresh
  const seenDataVersion = useRef(dataVersion)

  useEffect(() => {
    if (seenDataVersion.current === dataVersion) return
    seenDataVersion.current = dataVersion
    refresh()
    refreshPools()
    refreshBalance()
  }, [dataVersion, refresh, refreshBalance, refreshPools])

  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('view')
  const legacyTool = searchParams.get('tool')
  // Everspan shipped with four different tabs (overview/earn/portfolio/more)
  // before this pass merged Earn+Portfolio into Positions and split More into
  // Activity/Account. A link saved from that layout still has to land
  // somewhere sensible rather than a blank tab.
  const tab: TabId = (() => {
    switch (requestedTab) {
      case 'home':
      case 'positions':
      case 'activity':
      case 'account':
        return requestedTab
      case 'overview':
        return 'home'
      case 'earn':
      case 'portfolio':
        return 'positions'
      case 'more':
        return legacyTool === 'activity' ? 'activity' : 'account'
      default:
        return 'home'
    }
  })()
  const requestedSegment = searchParams.get('segment')
  const segment: PositionsSegment =
    requestedSegment === 'open'
      ? 'open'
      : requestedSegment === 'held'
        ? 'held'
        : requestedTab === 'earn'
          ? 'open'
          : 'held'
  const requestedScope = searchParams.get('scope')
  const activityScope: ActivityScope =
    requestedScope === 'protocol' ? 'protocol' : requestedScope === 'yours' ? 'yours' : 'yours'
  const forceAdvanced = legacyTool === 'convert'
  const requestedStrategy = searchParams.get('strategy')
  const strategy: EarnStrategy =
    requestedStrategy === 'yield' || requestedStrategy === 'liquidity' ? requestedStrategy : 'fixed'
  const maturity = parseMaturity(searchParams.get('maturity'))

  // A primary destination should start at its heading even when it is chosen
  // from the pinned mobile navigation after scrolling another long panel.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [tab])

  // A new event (ours or anyone's) may make reads stale — refresh both the
  // portfolio and pool reads in the background (no spinner flash).
  const activity = useProtocolEvents(() => {
    refreshSilent()
    pools.refreshSilent()
  })
  const personalActivity = useProtocolEvents(
    undefined,
    isConnected && address !== null ? address : null,
  )
  const dataError = error ?? pools.error

  function refreshAll(): void {
    refresh()
    pools.refresh()
    balance.refresh()
  }

  function updateLocation(next: {
    tab?: TabId
    segment?: PositionsSegment
    scope?: ActivityScope
    strategy?: EarnStrategy
    maturity?: bigint
    tool?: 'convert'
  }): void {
    const params = new URLSearchParams(searchParams)
    if (next.tab) params.set('view', next.tab)
    if (next.segment) params.set('segment', next.segment)
    if (next.scope) params.set('scope', next.scope)
    if (next.strategy) params.set('strategy', next.strategy)
    if (next.maturity !== undefined) params.set('maturity', next.maturity.toString())
    if (next.tool) params.set('tool', next.tool)
    setSearchParams(params)
  }

  function setTab(next: TabId): void {
    updateLocation({ tab: next })
  }

  function chooseStrategy(next: EarnStrategy, maturity?: bigint): void {
    updateLocation({ tab: 'positions', segment: 'open', strategy: next, maturity })
  }

  function openStrategy(next: EarnStrategy, maturity?: bigint): void {
    chooseStrategy(next, maturity)
    focusPanel('positions')
  }

  function goPool(maturity: bigint): void {
    updateLocation({ tab: 'positions', segment: 'open', strategy: 'liquidity', maturity })
    focusPanel('positions')
  }

  function goConvert(): void {
    updateLocation({ tab: 'account', tool: 'convert' })
    focusPanel('account')
  }

  function goPortfolio(): void {
    updateLocation({ tab: 'positions', segment: 'held' })
    focusPanel('positions')
  }

  const connected = isConnected && address !== null

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-10 px-4 lg:px-6">
        <aside className="hidden w-52 shrink-0 flex-col py-6 lg:flex">
          <Link
            to="/"
            className="flex min-h-11 items-center gap-2.5 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300"
          >
            <BrandMark className="h-6 w-6 text-neutral-50" />
            <span className="text-base font-medium tracking-[-0.02em] text-neutral-50">
              Everspan
            </span>
          </Link>

          <div className="mt-8">
            <SideNav active={tab} onChange={setTab} />
          </div>

          {/* Feedback and the Testnet disclaimer used to live here too, always
              visible regardless of tab — they now live once, in Account,
              since that is where "how the app behaves" belongs on every
              width, not just a desktop-only rail. */}
          <div className="mt-auto pt-8">
            <RateTicker rateInfo={portfolio.rateInfo} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Wraps rather than shrinks: the market switcher and the header's
              controls are both fixed-width, and on a phone they overlapped
              when forced onto one line. Below sm the switcher drops to its
              own row. */}
          <AppHeader
            marketKey={marketKey}
            onSwitchMarket={onSwitchMarket}
            address={address}
            liveRate={liveRate}
            personalActivity={personalActivity}
          />

          {/* Keyed by the tab so the panel plays its entrance when the reader
              changes destination — and only then. Keying it on mount instead
              would replay it after every resolved transaction, because that is
              what remounts this whole subtree. */}
          <main
            key={tab}
            id="app-main"
            tabIndex={-1}
            className="flex-1 space-y-6 py-6 motion-safe:animate-rise-in sm:py-8"
          >
            {/* /app is only reachable once connected (RequireSession redirects
                otherwise), so this is the first thing a reader sees on every
                visit — the real wallet balance, big, ahead of everything
                token-mechanics-shaped below it. */}
            {connected && (
              <>
                <BalanceCard
                  address={address}
                  balance={balance.balance}
                  funded={balance.funded}
                  loading={balance.loading}
                  error={balance.error}
                  hidden={amountsHidden}
                  onToggleHidden={toggleAmountsHidden}
                  onRefresh={balance.refresh}
                />

                <BalanceHero
                  holdings={holdings}
                  symbol={activeMarket().underlyingSymbol}
                  loading={loading}
                  hidden={amountsHidden}
                  onToggleHidden={toggleAmountsHidden}
                  onConvert={goConvert}
                  onPortfolio={goPortfolio}
                  onLiquidity={() => {
                    openStrategy('liquidity')
                  }}
                />

                <WalletBar
                  address={address}
                  underlying={portfolio.underlying}
                  loading={loading}
                  isWrongNetwork={isWrongNetwork}
                  onRefresh={refreshAll}
                />
              </>
            )}

            {tab === 'home' && (
              <HomePanel
                connected={connected}
                underlying={portfolio.underlying}
                sy={portfolio.sy}
                positions={portfolio.positions}
                loading={pools.loading || loading}
                pools={pools.pools}
                rateInfo={portfolio.rateInfo}
                liveRate={liveRate}
                error={dataError}
                onRetry={refreshAll}
                onEarn={openStrategy}
                onPortfolio={goPortfolio}
              />
            )}

            {tab === 'positions' &&
              (connected && dataError ? (
                <DataUnavailable error={dataError} onRetry={refreshAll} tab="positions" />
              ) : connected ? (
                <PositionsPanel
                  segment={segment}
                  onSegmentChange={(next) => updateLocation({ tab: 'positions', segment: next })}
                  address={address}
                  isWrongNetwork={isWrongNetwork}
                  portfolio={portfolio}
                  positions={portfolio.positions}
                  pools={pools.pools}
                  poolsLoading={pools.loading || loading}
                  loading={loading || pools.loading}
                  error={dataError}
                  liveRate={liveRate}
                  strategy={strategy}
                  onStrategyChange={(next) => chooseStrategy(next)}
                  maturity={maturity}
                  onMaturityChange={(next) => updateLocation({ maturity: next })}
                  onRefresh={refreshAll}
                  onSuccess={refreshAll}
                  onManagePool={goPool}
                  onConvert={goConvert}
                />
              ) : (
                <ConnectPrompt
                  tab="positions"
                  message="Connect a Testnet wallet to see your positions, lock a fixed return, hold yield exposure, or earn trading fees."
                />
              ))}

            {tab === 'activity' && (
              <ActivityPanel
                scope={activityScope}
                onScopeChange={(next) => updateLocation({ tab: 'activity', scope: next })}
                address={connected ? address : null}
                liveRate={liveRate}
                personalEvents={personalActivity.events}
                personalLoading={personalActivity.loading}
                personalError={personalActivity.error}
                onRetryPersonal={personalActivity.retry}
                protocolEvents={activity.events}
                protocolLoading={activity.loading}
                protocolError={activity.error}
                onRetryProtocol={activity.retry}
              />
            )}

            {tab === 'account' && (
              <AccountPanel
                portfolio={portfolio}
                liveRate={liveRate}
                loading={loading}
                onSuccess={refreshAll}
                forceAdvanced={forceAdvanced}
              />
            )}
          </main>
        </div>
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}

export default App

function parseMaturity(value: string | null): bigint | null {
  if (!value || !/^\d+$/.test(value)) return null
  try {
    return BigInt(value)
  } catch {
    return null
  }
}

function focusPanel(tab: TabId): void {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`#panel-${tab} [data-panel-heading]`)
        ?.focus({ preventScroll: true })
    })
  })
}

function focusActivePanel(): void {
  window.requestAnimationFrame(() => {
    document
      .querySelector<HTMLElement>('[role="tabpanel"] [data-panel-heading]')
      ?.focus({ preventScroll: true })
  })
}
