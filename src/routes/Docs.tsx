/** Public reference: what Everspan does, how to use it, and what it guarantees. */
import { useEffect, useRef, useState, type ReactElement } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DocsBody } from '../components/docs/DocsBody'
import { DOCS_SECTIONS } from '../components/docs/outline'
import {
  SITE_HEADER_CLEARANCE,
  SiteCta,
  SiteFooter,
  SiteHeader,
  siteNavItemClass,
} from '../components/SiteChrome'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useSurface } from '../hooks/useSurface'

/* ─────────────────────────────────────────────────────────
 * DOCUMENTATION
 *
 * A long single page rather than a route per section, for two reasons: the
 * whole reference is then searchable with the browser's own find, and a deep
 * link from anywhere else in the product — the landing chapters, the Account
 * tab — is an anchor that costs nothing to add and cannot 404.
 *
 * Navigation is the same list three times over (`DOCS_SECTIONS`): a sticky
 * index on a wide screen, a scrolling row of chips on a narrow one, and the
 * reading position that highlights the current entry in both.
 * ───────────────────────────────────────────────────────── */

export function Docs(): ReactElement {
  useSurface('site')
  useDocumentTitle('Documentation — Everspan')

  const active = useActiveSection()
  useHashLanding()

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <a
        href="#docs-main"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-neutral-50 transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-neutral-50 motion-reduce:transition-none"
      >
        Skip to main content
      </a>

      <SiteHeader nav={<DocsHeaderNav />} />

      <main id="docs-main" tabIndex={-1} className={SITE_HEADER_CLEARANCE}>
        <DocsHero />
        <SectionChips active={active} />

        <div className="mx-auto w-full max-w-[78rem] px-5 pb-24 sm:px-8 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 lg:px-10">
          <DocsIndex active={active} />
          <DocsBody />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function DocsHeaderNav(): ReactElement {
  return (
    <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
      {(
        [
          ['Protocol', 'protocol'],
          ['Markets', 'markets'],
          ['Security', 'security'],
        ] as const
      ).map(([label, id]) => (
        <a key={id} href={`#${id}`} className={siteNavItemClass}>
          {label}
        </a>
      ))}
      <Link to="/" className={siteNavItemClass}>
        Home
      </Link>
    </nav>
  )
}

function DocsHero(): ReactElement {
  return (
    <div className="mx-auto w-full max-w-[78rem] px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24 lg:px-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-500">
        Documentation
      </p>
      <h1 className="mt-6 max-w-4xl text-[2.75rem] font-medium leading-[0.9] tracking-[-0.06em] sm:text-[clamp(3.5rem,7vw,6rem)]">
        Everything Everspan does, explained.
      </h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
        Everspan turns a yield-bearing deposit into two tradeable positions: one that pays a fixed
        amount on a known date, and one that collects the yield until then. This is the reference
        for how that works, how to use it, and what it does and does not promise.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-2">
        <Chip>Stellar Testnet</Chip>
        <Chip>Seven Soroban contracts</Chip>
        <Chip>Open source</Chip>
      </div>
      <div className="mt-9 flex flex-wrap items-center gap-4">
        <SiteCta compact>Launch App</SiteCta>
        <a
          href="#overview"
          className="inline-flex min-h-11 items-center rounded-full border border-neutral-950/15 px-5 py-2 text-sm font-medium text-neutral-950 no-underline transition-colors duration-100 hover:bg-neutral-950/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          Start reading
        </a>
      </div>
    </div>
  )
}

function Chip({ children }: { children: string }): ReactElement {
  return (
    <span className="rounded-full border border-neutral-950/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-600">
      {children}
    </span>
  )
}

/** The index on a wide screen: sticky, and it says where you are. */
function DocsIndex({ active }: { active: string }): ReactElement {
  return (
    <nav
      aria-label="Documentation sections"
      className="hidden lg:sticky lg:top-[6.5rem] lg:block lg:self-start lg:pt-16"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
        On this page
      </p>
      <ol className="mt-5 space-y-1">
        {DOCS_SECTIONS.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? 'true' : undefined}
              className={`flex gap-3 rounded-md px-2 py-2 text-sm no-underline transition-colors duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 ${
                active === section.id
                  ? 'bg-neutral-950/5 text-neutral-950'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <span aria-hidden="true" className="font-mono text-[11px] text-neutral-600">
                {String(index + 1).padStart(2, '0')}
              </span>
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * The same index on a narrow screen. A row of chips that scrolls sideways and
 * keeps the current section in view — a ten-item dropdown would hide where the
 * reader is, which is the one thing this is for.
 */
function SectionChips({ active }: { active: string }): ReactElement {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const current = listRef.current?.querySelector<HTMLElement>('[aria-current="true"]')
    current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [active])

  return (
    <div className="sticky top-[4.5rem] z-30 border-y border-neutral-950/10 bg-neutral-50/95 backdrop-blur-md lg:hidden">
      <nav aria-label="Documentation sections">
        <ul ref={listRef} className="flex gap-2 overflow-x-auto px-5 py-3 sm:px-8">
          {DOCS_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active === section.id ? 'true' : undefined}
                className={`inline-flex min-h-9 items-center whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm no-underline transition-colors duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 ${
                  active === section.id
                    ? 'border-transparent bg-neutral-950 text-neutral-50'
                    : 'border-neutral-950/15 text-neutral-600'
                }`}
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

/**
 * How far down the page the reading line sits: the fixed header plus, on a
 * narrow screen, the row of section chips. `rootMargin` only accepts pixels or
 * percentages, never rem, so this is spelled in pixels.
 */
const READING_LINE_PX = 136

/**
 * Which section the reader is in — the last one whose heading has passed under
 * the fixed chrome. Two cheaper rules were wrong in the same way: the section
 * with the most pixels on screen, and the first one touching a band, both
 * report the section above for as long as its tail is still visible, which on
 * a page of long sections is most of the time.
 *
 * Sections are adjacent, so one leaving the band is the same event as the next
 * one crossing the line — which is why an observer is enough to drive this and
 * a scroll listener is not needed.
 */
function useActiveSection(): string {
  const [active, setActive] = useState(DOCS_SECTIONS[0].id)

  useEffect(() => {
    const sections = DOCS_SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (element): element is HTMLElement => element !== null,
    )
    if (sections.length === 0) return

    const resolve = (): void => {
      let current = sections[0].id
      for (const section of sections) {
        // A section reached by a deep link lands with its top exactly on the
        // reading line (`scroll-mt` is the same distance), and sub-pixel
        // layout puts that a fraction either side of it — so the comparison
        // has to be inclusive of a pixel, or the landing is off by one entry.
        if (section.getBoundingClientRect().top <= READING_LINE_PX + 1) current = section.id
      }
      setActive(current)
    }

    const observer = new IntersectionObserver(resolve, {
      rootMargin: `-${READING_LINE_PX}px 0px -60% 0px`,
    })
    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return active
}

/**
 * A deep link has to survive the page it lands on being built after the URL is
 * read. The browser resolves `#markets` against the document as it exists at
 * navigation time, and on a client-rendered route that is an empty shell — so
 * the jump is made again once the sections are actually in the DOM.
 */
function useHashLanding(): void {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    const target = document.getElementById(hash.slice(1))
    if (!target) return
    target.scrollIntoView({ behavior: 'auto', block: 'start' })
    // The heading, not the section box: a reader arriving from another page
    // should have the screen reader announce what they came for.
    document.getElementById(`${hash.slice(1)}-title`)?.focus({ preventScroll: true })
  }, [hash])
}
