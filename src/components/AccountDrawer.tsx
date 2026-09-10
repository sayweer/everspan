/** Who the reader is, and how the app behaves for them. */
import { useState, type ReactElement, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { activeMarket } from '../lib/market'
import { config, explorerContractUrl } from '../config'
import { focusRing } from '../lib/buttonStyles'
import { SideDrawer } from './SideDrawer'
import {
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CopyIcon,
  ExternalLinkIcon,
  GlobeIcon,
  InfoIcon,
  LayersIcon,
  MessageIcon,
  MoonIcon,
  SunIcon,
  SwapIcon,
  WalletIcon,
} from './icons'

interface AccountDrawerProps {
  open: boolean
  onClose: () => void
}

/*
 * The rule that decides what belongs here, and it is worth keeping: a tab is
 * for something the reader *does* — hold a position, lock a rate, convert an
 * asset. This drawer is for who they *are* and how the app behaves — the
 * account, the preferences, the way out to the docs. A new feature goes to a
 * tab if it is a task and to a group below if it is configuration or reference.
 * Without that line the drawer and the More tab both become "everything else".
 */
export function AccountDrawer({ open, onClose }: AccountDrawerProps): ReactElement {
  const { address, isConnected, isWrongNetwork, networkUnknown, connect, disconnect } = useWallet()
  const { theme, toggleTheme } = useTheme()
  const { language, toggleLanguage } = useLanguage()
  const [copied, setCopied] = useState(false)
  const market = activeMarket()
  const connected = isConnected && address !== null

  async function copyAddress(): Promise<void> {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => {
        setCopied(false)
      }, 1600)
    } catch {
      // A clipboard the browser refuses is not worth an error surface here —
      // the full address is selectable in the wallet bar.
    }
  }

  return (
    <SideDrawer open={open} onClose={onClose} title="Account">
      <Identity
        address={connected ? address : null}
        isWrongNetwork={isWrongNetwork}
        networkUnknown={networkUnknown}
      />

      {connected ? (
        <Group label="Wallet">
          <RowButton
            icon={copied ? <CheckIcon className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
            title={copied ? 'Address copied' : 'Copy address'}
            subtitle="Put the account on the clipboard"
            onClick={() => {
              void copyAddress()
            }}
          />
          <RowExternal
            icon={<LayersIcon className="h-5 w-5" />}
            title="View account on explorer"
            subtitle="Open it on stellar.expert"
            href={`${config.stellarExpertUrl}/account/${address}`}
          />
          <RowButton
            icon={<WalletIcon className="h-5 w-5" />}
            title="Disconnect"
            subtitle="Clear the session on this device"
            tone="negative"
            onClick={() => {
              disconnect()
              onClose()
            }}
          />
        </Group>
      ) : (
        <Group label="Wallet">
          <RowButton
            icon={<WalletIcon className="h-5 w-5" />}
            title="Connect a wallet"
            subtitle="Choose from the wallets on this device"
            onClick={() => {
              void connect()
              onClose()
            }}
          />
        </Group>
      )}

      <Group label="Tools">
        <RowLink
          icon={<SwapIcon className="h-5 w-5" />}
          title="Convert"
          subtitle={`Move between ${market.underlyingSymbol} and SY`}
          to="/app?view=more&tool=convert"
          onNavigate={onClose}
        />
        <RowLink
          icon={<ClockIcon className="h-5 w-5" />}
          title="Activity"
          subtitle="Every event the protocol has published"
          to="/app?view=more&tool=activity"
          onNavigate={onClose}
        />
      </Group>

      <Group label="Preferences">
        <RowButton
          icon={theme === 'dark' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
          title="Appearance"
          subtitle="Dark or light surface"
          value={theme === 'dark' ? 'Dark' : 'Light'}
          onClick={toggleTheme}
        />
        <RowButton
          icon={<GlobeIcon className="h-5 w-5" />}
          title="Language"
          subtitle="Interface language"
          value={language === 'tr' ? 'Türkçe' : 'English'}
          onClick={toggleLanguage}
        />
      </Group>

      <Group label="About">
        <RowLink
          icon={<InfoIcon className="h-5 w-5" />}
          title="How it works"
          subtitle="The walkthrough on the home page"
          to="/"
          onNavigate={onClose}
        />
        <RowExternal
          icon={<LayersIcon className="h-5 w-5" />}
          title="Contracts on explorer"
          subtitle={`The ${market.label} Market on Testnet`}
          href={explorerContractUrl(market.splitterContractId)}
        />
        {config.feedbackFormUrl && (
          <RowExternal
            icon={<MessageIcon className="h-5 w-5" />}
            title="Share feedback"
            subtitle="Tell us what is missing or broken"
            href={config.feedbackFormUrl}
          />
        )}
      </Group>

      <p className="px-5 pt-6 text-[11px] leading-relaxed text-neutral-600">
        Testnet only. Never share your secret key.
      </p>
    </SideDrawer>
  )
}

/* The reader's own account, stated before anything they can change about it. */
function Identity({
  address,
  isWrongNetwork,
  networkUnknown,
}: {
  address: string | null
  isWrongNetwork: boolean
  networkUnknown: boolean
}): ReactElement {
  const network = isWrongNetwork
    ? 'Wrong network'
    : networkUnknown
      ? 'Network unreported'
      : 'Stellar Testnet'

  return (
    <div className="flex items-center gap-3 px-5 pb-5 pt-1">
      <span
        aria-hidden="true"
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-boundary text-neutral-300"
      >
        <WalletIcon className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-mono text-sm text-neutral-50">
          {address ? `${address.slice(0, 4)}…${address.slice(-4)}` : 'Not connected'}
        </span>
        <span
          className={`mt-0.5 block truncate text-xs ${
            isWrongNetwork ? 'text-negative-300' : 'text-neutral-500'
          }`}
        >
          {address ? network : 'Connect to see your positions'}
        </span>
      </span>
    </div>
  )
}

/*
 * A labelled band rather than a bare divider. The reference this follows leans
 * on spacing alone, which works when every row is a household name; ours are
 * not, and a reader scanning for "where do I change the language" is served by
 * the word far more than by the gap.
 */
function Group({ label, children }: { label: string; children: ReactNode }): ReactElement {
  return (
    <section className="border-t border-hairline pb-1 pt-4">
      <h3 className="px-5 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-600">
        {label}
      </h3>
      {children}
    </section>
  )
}

interface RowContentProps {
  icon: ReactNode
  title: string
  subtitle: string
  value?: string
  tone?: 'default' | 'negative'
  trailing?: ReactNode
}

const ROW =
  'flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-100 hover:bg-raised'

function RowContent({ icon, title, subtitle, value, tone, trailing }: RowContentProps): ReactElement {
  return (
    <>
      <span
        aria-hidden="true"
        className={`shrink-0 ${tone === 'negative' ? 'text-negative-300' : 'text-neutral-400'}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm font-medium ${
            tone === 'negative' ? 'text-negative-300' : 'text-neutral-100'
          }`}
        >
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-neutral-500">{subtitle}</span>
      </span>
      {value && <span className="shrink-0 text-xs text-neutral-400">{value}</span>}
      {trailing}
    </>
  )
}

/* Rotated rather than a second icon: the chevron that points down to open a
   sheet is the same mark that points right to walk into a row. */
function Chevron(): ReactElement {
  return (
    <ChevronDownIcon aria-hidden="true" className="h-4 w-4 shrink-0 -rotate-90 text-neutral-600" />
  )
}

function RowButton({
  onClick,
  ...content
}: RowContentProps & { onClick: () => void }): ReactElement {
  return (
    <button type="button" onClick={onClick} className={`${ROW} ${focusRing}`}>
      <RowContent {...content} />
    </button>
  )
}

function RowLink({
  to,
  onNavigate,
  ...content
}: RowContentProps & { to: string; onNavigate: () => void }): ReactElement {
  return (
    <Link to={to} onClick={onNavigate} className={`${ROW} no-underline ${focusRing}`}>
      <RowContent {...content} trailing={<Chevron />} />
    </Link>
  )
}

/* The trailing mark is the difference between a row that walks deeper into the
   app and one that hands the reader to another site. A chevron on both would
   make the tab that opens behind them a surprise. */
function RowExternal({ href, ...content }: RowContentProps & { href: string }): ReactElement {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${ROW} no-underline ${focusRing}`}
    >
      <RowContent
        {...content}
        trailing={
          <ExternalLinkIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-neutral-600" />
        }
      />
    </a>
  )
}
