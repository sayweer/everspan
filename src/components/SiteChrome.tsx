/**
 * The header and footer the two public pages share — the marketing route and
 * the documentation. Only the middle of the header differs between them: on
 * the landing the chapter names drive a scroll-jacked stage, in the docs they
 * are ordinary anchors. That part arrives as a prop; everything around it —
 * the mark, the language switch, the way in to the app, the footer — is the
 * same on both, and lives here so it can only be changed in one place.
 */
import type { ReactElement, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { LanguageToggle } from './LanguageToggle'
import { EnterApp } from './AppEntry'
import { ArrowRightIcon } from './icons'

/** Height of the fixed header, in the one place both pages can read it. */
export const SITE_HEADER_CLEARANCE = 'pt-[4.5rem]'

/**
 * Fixed, not sticky: in flow the header pushed the scroll stage down by its own
 * height, and that offset became dead scroll before the opening could start.
 */
export function SiteHeader({ nav }: { nav?: ReactNode }): ReactElement {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-neutral-950/10 bg-neutral-50/95 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[96rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="flex min-h-11 items-center gap-2.5 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-50"
        >
          <BrandMark className="h-6 w-6 text-accent-500" />
          <span className="hidden text-base font-medium tracking-[-0.025em] min-[375px]:inline">
            Everspan
          </span>
        </Link>

        {nav}

        <div className="flex items-center gap-2">
          <LanguageToggle light />
          <SiteCta compact>Launch App</SiteCta>
        </div>
      </div>
    </header>
  )
}

/** The shared class vocabulary for a header or hero nav item. */
export const siteNavItemClass =
  'inline-flex min-h-11 items-center rounded-sm px-1 text-sm text-neutral-600 no-underline transition-colors duration-100 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500'

export function SiteCta({
  children,
  compact = false,
}: {
  children: ReactNode
  compact?: boolean
}): ReactElement {
  return (
    <EnterApp
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-accent-500 font-medium text-neutral-50 [touch-action:manipulation] [-webkit-tap-highlight-color:transparent] transition-transform duration-100 ease-spring motion-safe:hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 motion-reduce:transform-none ${
        compact ? 'min-h-11 px-5 py-2 text-sm' : 'min-h-12 w-full px-6 py-3 text-sm sm:w-auto'
      }`}
    >
      {children}
      <ArrowRightIcon className="h-4 w-4 transition-transform duration-100 group-hover:translate-x-1 motion-reduce:transform-none" />
    </EnterApp>
  )
}

export function SiteFooter(): ReactElement {
  return (
    <footer className="surface-ink bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-5 w-5 text-accent-400" />
            <span className="text-sm font-medium tracking-[-0.015em]">Everspan</span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <FooterLink to="/docs">Documentation</FooterLink>
            <FooterLink to="/docs#app">How to use Everspan</FooterLink>
            <FooterLink to="/docs#security">Security</FooterLink>
            <FooterLink to="/docs#contracts">Contracts</FooterLink>
          </nav>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
          Stellar Testnet · Soroban · 2026
        </p>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }: { to: string; children: ReactNode }): ReactElement {
  return (
    <Link
      to={to}
      className="text-sm text-neutral-400 no-underline transition-colors duration-100 hover:text-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
    >
      {children}
    </Link>
  )
}
