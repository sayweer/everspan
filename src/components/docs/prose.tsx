/**
 * The typographic vocabulary the documentation is written in.
 *
 * A reference page is mostly the same eight shapes repeated — a paragraph, a
 * sub-heading, a list, a numbered procedure, a table, a callout, a formula, a
 * definition. Spelling each one once here is what keeps forty screens of prose
 * looking like a single document, and it means the page itself reads as an
 * outline rather than as a wall of class names.
 *
 * Everything here is written for the light marketing surface, the same one the
 * landing page uses — the documentation is a public page, not part of the dark
 * product console.
 */
import { useState, type ReactElement, type ReactNode } from 'react'
import { CheckIcon, CopyIcon, ExternalLinkIcon } from '../icons'

export function Section({
  id,
  index,
  title,
  lede,
  children,
}: {
  id: string
  /** Printed beside the title; the reader can cite "section 04". */
  index: number
  title: string
  lede: string
  children: ReactNode
}): ReactElement {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      /* An anchor has to stop short of whatever is fixed above it, or every
         jump lands with the heading hidden. On a narrow screen that is the
         header plus the row of section chips; on a wide one the chips are
         gone and the index sits beside the text instead. */
      className="scroll-mt-[8.5rem] border-t border-neutral-950/10 py-14 first:border-t-0 first:pt-0 sm:py-20 sm:first:pt-0 lg:scroll-mt-24"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-500">
        {String(index).padStart(2, '0')}
      </p>
      <h2
        id={`${id}-title`}
        /* Focusable so a deep link can hand the reader the heading they asked
           for, rather than dropping them mid-page with focus still on <body>. */
        tabIndex={-1}
        className="mt-4 max-w-3xl text-[2rem] font-medium leading-[0.95] tracking-[-0.05em] outline-none sm:text-[clamp(2.5rem,4vw,3.5rem)]"
      >
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">{lede}</p>
      <div className="mt-10 space-y-6">{children}</div>
    </section>
  )
}

export function Sub({ title, children }: { title: string; children: ReactNode }): ReactElement {
  return (
    <div className="space-y-4 pt-4">
      <h3 className="text-xl font-medium tracking-[-0.03em] sm:text-2xl">{title}</h3>
      {children}
    </div>
  )
}

export function P({ children }: { children: ReactNode }): ReactElement {
  return <p className="max-w-2xl leading-relaxed text-neutral-600">{children}</p>
}

export function Bullets({ items }: { items: ReactNode[] }): ReactElement {
  return (
    <ul className="max-w-2xl space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 leading-relaxed text-neutral-600">
          <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** A procedure. Numbered because the order is the content. */
export function Numbered({
  items,
}: {
  items: readonly { title: string; text: string }[]
}): ReactElement {
  return (
    <ol className="max-w-2xl space-y-6">
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-4">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-950 font-mono text-[11px] text-neutral-50"
          >
            {index + 1}
          </span>
          <div>
            <p className="font-medium tracking-[-0.015em] text-neutral-950">{item.title}</p>
            <p className="mt-1.5 leading-relaxed text-neutral-600">{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/**
 * Tables scroll sideways on a phone rather than wrapping every cell into a
 * column one word wide. The scroller is focusable so it can be reached with a
 * keyboard alone, which is what makes an overflowing table accessible.
 */
export function Table({
  caption,
  head,
  rows,
}: {
  caption: string
  head: readonly string[]
  rows: readonly (readonly ReactNode[])[]
}): ReactElement {
  return (
    <div
      tabIndex={0}
      role="group"
      aria-label={caption}
      className="-mx-5 overflow-x-auto px-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 sm:mx-0 sm:px-0"
    >
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-neutral-950/15">
            {head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="py-3 pr-6 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-neutral-600 last:pr-0"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-neutral-950/10 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`py-4 pr-6 align-top leading-relaxed last:pr-0 ${
                    cellIndex === 0 ? 'font-medium text-neutral-950' : 'text-neutral-600'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warning'
  title: string
  children: ReactNode
}): ReactElement {
  return (
    <aside
      className={`max-w-2xl rounded-2xl border p-5 ${
        tone === 'warning'
          ? 'border-neutral-950/15 bg-neutral-200'
          : 'border-neutral-950/10 bg-neutral-100'
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">{title}</p>
      <div className="mt-3 leading-relaxed text-neutral-950">{children}</div>
    </aside>
  )
}

/** A formula, set apart from the prose so it can be read as one object. */
export function Formula({
  expression,
  caption,
}: {
  expression: string
  caption: string
}): ReactElement {
  return (
    <figure className="max-w-2xl">
      <div className="surface-ink overflow-x-auto rounded-2xl bg-neutral-950 px-5 py-6 text-neutral-50">
        <code className="whitespace-pre font-mono text-sm leading-relaxed">{expression}</code>
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-neutral-600">{caption}</figcaption>
    </figure>
  )
}

export function Terms({
  items,
}: {
  items: readonly { term: string; text: string }[]
}): ReactElement {
  return (
    <dl className="max-w-2xl divide-y divide-neutral-950/10 border-y border-neutral-950/10">
      {items.map((item) => (
        <div key={item.term} className="py-5 sm:grid sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
          <dt className="font-medium tracking-[-0.015em] text-neutral-950">{item.term}</dt>
          <dd className="mt-1.5 leading-relaxed text-neutral-600 sm:mt-0">{item.text}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Questions open one at a time is a pattern people fight with; these are all
 * open. A reference page is read by scanning and by searching the page, and a
 * collapsed answer is invisible to both.
 */
export function Faq({ items }: { items: readonly { q: string; a: string }[] }): ReactElement {
  return (
    <div className="max-w-2xl divide-y divide-neutral-950/10 border-y border-neutral-950/10">
      {items.map((item) => (
        <div key={item.q} className="py-6">
          <h3 className="font-medium tracking-[-0.015em] text-neutral-950">{item.q}</h3>
          <p className="mt-2.5 leading-relaxed text-neutral-600">{item.a}</p>
        </div>
      ))}
    </div>
  )
}

export function LinkOut({ href, children }: { href: string; children: ReactNode }): ReactElement {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-accent-500 underline underline-offset-4 transition-colors duration-100 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
    >
      {children}
      <ExternalLinkIcon className="h-3.5 w-3.5" />
    </a>
  )
}

/**
 * A deployed contract: what it is, its id, and the two things a reader wants
 * to do with an id — copy it, or open it on the explorer.
 */
export function AddressRow({
  label,
  note,
  id,
  href,
}: {
  label: string
  note: string
  id: string
  href: string
}): ReactElement {
  const [copied, setCopied] = useState(false)

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // The id is selectable in the row; a clipboard the browser refuses is
      // not worth an error surface on a reference page.
    }
  }

  return (
    <div className="flex flex-col gap-3 border-b border-neutral-950/10 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="font-medium tracking-[-0.015em] text-neutral-950">{label}</p>
        <p className="mt-0.5 text-sm text-neutral-600">{note}</p>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded bg-neutral-200 px-2.5 py-1.5 font-mono text-xs text-neutral-950 sm:max-w-[18rem]">
          {id}
        </code>
        <button
          type="button"
          onClick={() => {
            void copy()
          }}
          aria-label={`Copy address ${label}`}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors duration-100 hover:bg-neutral-950/5 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
        </button>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${label} on the explorer`}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors duration-100 hover:bg-neutral-950/5 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          <ExternalLinkIcon className="h-4 w-4" />
        </a>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Address copied' : ''}
      </span>
    </div>
  )
}
