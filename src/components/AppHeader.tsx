/** The app's top bar: one row at every width. */
import { useState, type ReactElement } from 'react'
import { markets, type MarketKey } from '../config'
import { buttonClasses } from '../lib/buttonStyles'
import { AccountDrawer } from './AccountDrawer'
import { BottomSheet } from './BottomSheet'
import { MenuButton } from './MenuButton'
import { ChevronDownIcon } from './icons'
import { MarketSwitcher } from './MarketSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { WalletButton } from './WalletButton'
import { LanguageToggle } from './LanguageToggle'

interface AppHeaderProps {
  marketKey: MarketKey
  onSwitchMarket: (key: MarketKey) => void
}

/**
 * A leaf component on purpose: it owns the market sheet's open state, and
 * anything stateful living higher would re-render the whole panel tree on
 * every open and close.
 *
 * The bar holds one row at every width. It used to be a wrapping flex row, so
 * a phone got two lines and a 320px screen got four — a quarter of the visible
 * page spent on chrome before a single figure. What made that possible was
 * moving the market switcher behind a chip: it is a control a reader touches
 * once a session, and it was claiming a full-width row permanently.
 */
export function AppHeader({ marketKey, onSwitchMarket }: AppHeaderProps): ReactElement {
  const [marketSheetOpen, setMarketSheetOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const switchable = markets.length > 1
  const current = markets.find((market) => market.key === marketKey) ?? markets[0]

  return (
    <header className="sticky top-[env(safe-area-inset-top)] z-20 -mx-4 flex h-14 items-center gap-2 border-b border-hairline bg-neutral-950/90 px-4 backdrop-blur lg:mx-0 lg:h-16 lg:px-0">
      {/* The mark used to sit here and had to be dropped below 375px, which
          left the narrowest phones with no left-hand control at all. The menu
          takes the slot instead: it fits at every width, and the way home is
          one of the things it holds. The desktop rail already carries both the
          mark and the navigation, so this is the phone's control only. */}
      <span className="lg:hidden">
        <MenuButton
          open={drawerOpen}
          onClick={() => {
            setDrawerOpen((current) => !current)
          }}
        />
      </span>
      {switchable && (
        <>
          <div className="hidden lg:block">
            <MarketSwitcher active={marketKey} onChange={onSwitchMarket} />
          </div>
          <button
            id="market-trigger"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={marketSheetOpen}
            onClick={() => {
              setMarketSheetOpen(true)
            }}
            className={`${buttonClasses({ variant: 'secondary' })} min-w-0 lg:hidden`}
          >
            <span className="truncate">{current.label}</span>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-neutral-400" />
          </button>
        </>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <LanguageToggle />
        {/* A preference, not a task: on a phone it lives in the More panel so
            the row can spend its width on the market and the wallet. */}
        <span className="hidden sm:inline-flex">
          <ThemeToggle />
        </span>
        <WalletButton />
      </div>

      <AccountDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
        }}
      />

      {switchable && (
        <BottomSheet
          open={marketSheetOpen}
          onClose={() => {
            setMarketSheetOpen(false)
          }}
          title="Yield source"
        >
          <MarketSwitcher
            active={marketKey}
            layout="stacked"
            idPrefix="market-sheet-"
            onChange={(key) => {
              setMarketSheetOpen(false)
              onSwitchMarket(key)
            }}
          />
          <p className="mt-4 text-xs leading-relaxed text-neutral-400">
            Each source is a separate deployment. Switching reloads balances and positions from that
            market.
          </p>
        </BottomSheet>
      )}
    </header>
  )
}
