/**
 * The two card shells every panel in the app is built from: `raised` is the
 * outer panel sitting on the page, `sunken` is the inner summary box nested
 * inside one. Kept beside `buttonStyles.ts` for the same reason — a plain
 * function lets both a `<section>` and a `<div>` share the recipe without a
 * polymorphic component, and it stops the pair from drifting out of sync one
 * file at a time the way they had in eleven separate call sites.
 */

export type CardTone = 'raised' | 'sunken'
export type CardPadding = 'none' | 'sm' | 'md'

export interface CardStyleOptions {
  tone?: CardTone
  padding?: CardPadding
}

const RADIUS: Record<CardTone, string> = {
  raised: 'rounded-2xl',
  sunken: 'rounded-xl',
}

const FILL: Record<CardTone, string> = {
  raised: 'border border-hairline bg-neutral-900',
  sunken: 'border border-hairline bg-neutral-950/40',
}

const PADDING: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
}

/**
 * Classes for a card shell. `padding: 'none'` is for a caller that mixes in
 * its own padding alongside layout classes (a grid, a horizontal scroller) —
 * anything else passed alongside this should be layout only, for the same
 * reason `buttonClasses` callers stick to layout: Tailwind's output order,
 * not string order, decides which of two colliding utilities wins.
 */
export function cardClasses({ tone = 'raised', padding = 'md' }: CardStyleOptions = {}): string {
  return `${RADIUS[tone]} ${FILL[tone]} ${PADDING[padding]}`.trim()
}
