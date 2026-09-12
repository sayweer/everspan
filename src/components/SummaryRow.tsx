/** A labelled figure line in a quote/summary breakdown — shared by TradePanel and PoolPanel. */
import type { ReactElement, ReactNode } from 'react'

interface SummaryRowProps {
  label: string
  children: ReactNode
  /*
   * Emphasis, not status. The success tone means "this transaction worked";
   * spending it on an ordinary output figure both mislabels the figure and
   * dilutes the one colour that has to mean confirmation.
   */
  accent?: boolean
}

export function SummaryRow({ label, children, accent }: SummaryRowProps): ReactElement {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] items-start gap-3 text-sm">
      <span className="text-neutral-400">{label}</span>
      <span
        className={`min-w-0 break-all text-right font-mono tabular-nums ${accent ? 'font-medium text-accent-300' : 'text-neutral-200'}`}
      >
        {children}
      </span>
    </div>
  )
}
