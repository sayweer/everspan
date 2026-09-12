/** The app's top bar: one row at every width. */
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { iconButtonClasses } from '../lib/buttonStyles'
import type { UseProtocolEventsResult } from '../hooks/useProtocolEvents'
import { useDisclosure } from '../hooks/useDisclosure'
import { BrandMark } from './BrandMark'
import { BellIcon, ClockIcon } from './icons'
import { NotificationsSheet } from './NotificationsSheet'
import { ThemeToggle } from './ThemeToggle'
import { TransactionsSheet } from './TransactionsSheet'
import { LanguageToggle } from './LanguageToggle'

interface AppHeaderProps {
  address: string | null
  liveRate: bigint | null
  personalActivity: UseProtocolEventsResult
}

/**
 * The bar holds one row at every width. It used to be a wrapping flex row, so
 * a phone got two lines and a 320px screen got four — a quarter of the visible
 * page spent on chrome before a single figure. The market switcher used to
 * live here too; it moved to Account's Preferences group, since which
 * deployment to read from is a setting a reader touches once a session, not
 * chrome that earns a permanent line at the top of every tab.
 */
export function AppHeader({
  address,
  liveRate,
  personalActivity,
}: AppHeaderProps): ReactElement {
  const transactionsSheet = useDisclosure()
  const notificationsSheet = useDisclosure()

  return (
    <header className="sticky top-[env(safe-area-inset-top)] z-20 -mx-4 flex h-14 items-center gap-2 border-b border-hairline bg-neutral-950/90 px-4 backdrop-blur lg:mx-0 lg:h-16 lg:px-0">
      {/* The desktop rail already carries the mark and the navigation, so this
          is the phone's way home only — Account (in the bottom nav) now
          carries everything the old drawer held. */}
      <Link
        to="/"
        aria-label="Everspan home"
        className={`${iconButtonClasses({ variant: 'ghost' })} -ml-2 lg:hidden`}
      >
        <BrandMark className="h-5 w-5" />
      </Link>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <LanguageToggle />
        {/* A preference, not a task: on a phone it lives in the More panel so
            the row can spend its width on the market and these controls. */}
        <span className="hidden sm:inline-flex">
          <ThemeToggle />
        </span>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={transactionsSheet.open}
          aria-label="Transactions"
          title="Transactions"
          onClick={transactionsSheet.show}
          className={iconButtonClasses({ variant: 'ghost' })}
        >
          <ClockIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={notificationsSheet.open}
          aria-label="Notifications"
          title="Notifications"
          onClick={notificationsSheet.show}
          className={iconButtonClasses({ variant: 'ghost' })}
        >
          <BellIcon className="h-5 w-5" />
        </button>
      </div>

      <TransactionsSheet
        open={transactionsSheet.open}
        onClose={transactionsSheet.hide}
        address={address}
        liveRate={liveRate}
        personalActivity={personalActivity}
      />

      <NotificationsSheet open={notificationsSheet.open} onClose={notificationsSheet.hide} />
    </header>
  )
}
