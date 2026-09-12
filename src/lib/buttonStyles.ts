/**
 * The class vocabulary every pressable control in Everspan is built from.
 *
 * Kept here rather than beside the components on purpose: five link-shaped
 * controls (`<a>` / `<Link>`) need the same look without being a `<button>`,
 * and a plain function lets them have it without a polymorphic `as` prop. It
 * also keeps `src/components/Button.tsx` exporting components only, which is
 * what `react-refresh/only-export-components` asks for.
 *
 * ── Why there is no press treatment ───────────────────────────────────────
 * A tap fires its action immediately — the control does not need to perform
 * "being pressed" first. The only motion left is `hover:scale-[1.04]`, and
 * `hoverOnlyWhenSupported` in the Tailwind config keeps it off touch screens
 * entirely, so a phone never sees it and a mouse gets a small, deliberate
 * zoom instead of a tap flash it can't produce anyway.
 *
 * ── Why `outline` and not `ring` ──────────────────────────────────────────
 * `ring-offset` paints an opaque band that has to be told the colour of
 * whatever sits behind the control — which is why the app had four different
 * `ring-offset-*` colours, some of them wrong for the surface they landed on.
 * `outline-offset` leaves a real gap that the actual backdrop shows through,
 * so one string is correct on the canvas, on a panel and inside an inset box.
 */

export type ButtonVariant = 'primary' | 'positive' | 'secondary' | 'ghost' | 'danger' | 'warning'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonStyleOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Fill the width of the parent — the default for a submit on a phone. */
  full?: boolean
}

/**
 * The focus treatment on its own, for controls that are not buttons (rows,
 * disclosure summaries, links in prose) but still owe the reader a ring.
 */
export const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300'

const base = [
  'relative inline-flex select-none items-center justify-center gap-2 rounded-full',
  'font-semibold no-underline',
  // Kills the 300ms tap delay and the grey flash iOS paints over a tapped
  // control — both are tells that nobody styled this for a finger.
  '[touch-action:manipulation] [-webkit-tap-highlight-color:transparent]',
  'transition-[background-color,border-color,color,transform] duration-100 ease-spring',
  'motion-safe:hover:scale-[1.04]',
  focusRing,
  'disabled:cursor-not-allowed',
  // `pending` is spelled as `aria-disabled` rather than `disabled` so the
  // control keeps its place in the focus order while it works.
  'aria-disabled:cursor-wait aria-disabled:opacity-80',
].join(' ')

const SIZES: Record<ButtonSize, string> = {
  /*
   * 36px tall but still a 44px target: the pseudo-element extends the hit area
   * past the paint. Only safe where no ancestor clips overflow, which is true
   * of the two places it is used (the MAX button inside the amount field's
   * absolute cluster, and the slippage presets).
   */
  sm: "min-h-9 px-3 text-xs after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
  md: 'min-h-11 px-4 py-2 text-sm',
  /** The submit size — matches the geometry the action cards already use. */
  lg: 'min-h-11 px-5 py-2.5 text-sm',
}

const ICON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
}

/*
 * One `disabled:` spelling per variant, where the app previously had five
 * across the codebase.
 *
 * `primary` is deliberately colourless — it is the ink, black on paper and
 * white on the black ground. Colour in this app means the reader is about to
 * commit something or to undo something, so it belongs to `positive` and
 * `danger` alone; a "Continue" that borrowed green would spend the signal on
 * a step that carries no consequence.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-500 text-onAccent hover:bg-accent-400 disabled:bg-raised disabled:text-neutral-600',
  /* The commit: signing a deposit, buying a position, adding liquidity. */
  positive:
    'bg-positive-500 text-onPositive hover:bg-positive-400 disabled:bg-raised disabled:text-neutral-600',
  secondary:
    'border border-boundary bg-neutral-900 text-neutral-200 hover:bg-raised hover:text-neutral-100 disabled:border-hairline disabled:bg-transparent disabled:text-neutral-600',
  /*
   * No hover fill on purpose — this is the chrome-level control (header
   * icons, sheet/toast dismiss), sitting directly on the canvas rather than
   * inside a card. A hover ring there reads as a patch of a different colour
   * next to true black; the shared `hover:scale` in `base` is feedback enough.
   */
  ghost: 'text-neutral-400 hover:text-neutral-100 disabled:text-neutral-600',
  danger:
    'border border-negative-300 text-negative-100 hover:bg-negative-500/10 disabled:border-hairline disabled:text-neutral-600',
  /*
   * The transaction-safety banner's three controls. `danger` is red because
   * it reverses something; `warning` is grey because "this may still be
   * running" is a caution, not a destructive act.
   */
  warning:
    'border border-warning-300 text-warning-100 hover:bg-warning-500/10 disabled:border-hairline disabled:text-neutral-600',
}

/**
 * Classes for a text button. Anything passed alongside this should be layout
 * only — margin, width, grid placement — because those never collide with the
 * tokens chosen here, and Tailwind's output order, not string order, decides
 * which of two colliding utilities wins.
 */
export function buttonClasses({
  variant = 'secondary',
  size = 'md',
  full = false,
}: ButtonStyleOptions = {}): string {
  return `${base} ${SIZES[size]} ${VARIANTS[variant]}${full ? ' w-full' : ''}`
}

/** Classes for a square icon-only control. */
export function iconButtonClasses({
  variant = 'secondary',
  size = 'md',
}: Omit<ButtonStyleOptions, 'full'> = {}): string {
  return `${base} shrink-0 ${ICON_SIZES[size]} ${VARIANTS[variant]}`
}

/**
 * The three segmented controls in the app (mode toggle, slippage presets,
 * market switcher) look identical and behave identically under the finger, but
 * each carries different ARIA — `aria-pressed`, `aria-checked` and a roving
 * radiogroup. They share the paint from here and keep their own semantics.
 */
/**
 * The track carries no radius of its own: a control that stays on one line
 * wants a pill, and one that stacks its options on a narrow screen wants a
 * rounded box — a pill there leaves the corner of the top option sitting
 * outside the curve. The caller knows which it is.
 */
export const segmentTrackClass = 'border border-boundary p-1'

/**
 * `size` is a parameter rather than something a caller appends, because
 * `px-3 text-xs` bolted onto a string that already says `px-4 text-sm` is
 * decided by Tailwind's output order, not by the order of the strings — the
 * override silently loses about half the time.
 */
export function segmentClasses(selected: boolean, size: 'sm' | 'md' = 'md'): string {
  return [
    'relative min-h-11 rounded-full font-medium leading-snug',
    size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm',
    'select-none whitespace-normal [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]',
    'transition-[background-color,color] duration-100 ease-spring',
    // A tighter offset than a standalone button: the track's 4px padding is
    // the only room the ring has to sit in.
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-300',
    selected ? 'bg-raised text-neutral-100' : 'text-neutral-400 hover:text-neutral-200',
  ].join(' ')
}
