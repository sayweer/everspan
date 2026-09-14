/**
 * A token drawn as a coin: a solid disc in the asset's colour with a flat glyph
 * on top. XLM reuses the Stellar mark; the others are 24-unit glyphs drawn to
 * sit inside the disc's safe area.
 */
import type { ReactElement } from 'react'
import { TOKEN_MARK_COLORS, type TokenMark } from '../lib/tokenMarks'
import { StellarMark } from './StellarMark'

const GLYPHS: Record<Exclude<TokenMark, 'xlm'>, ReactElement> = {
  musdy: (
    <path
      d="M15.2 8.9c-.6-1-1.8-1.6-3.2-1.6-1.8 0-3.1.9-3.1 2.3 0 3.2 6.3 1.7 6.3 4.8 0 1.4-1.3 2.4-3.2 2.4-1.5 0-2.7-.6-3.3-1.7M12 5.6v1.7M12 16.8v1.7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  ),
  principal: (
    <>
      <path d="M9.3 11V9.4a2.7 2.7 0 0 1 5.4 0V11" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <rect x="7.4" y="10.8" width="9.2" height="7" rx="1.8" fill="currentColor" />
    </>
  ),
  yield: (
    <path
      d="M6.6 15.8l3.6-3.6 2.6 2.6 4.6-4.6M13.9 10.2h3.5v3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  liquidity: (
    <>
      <circle cx="9.6" cy="12" r="3.9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle
        cx="14.4"
        cy="12"
        r="3.9"
        fill="currentColor"
        fillOpacity=".35"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </>
  ),
}

interface TokenIconProps {
  mark: TokenMark
  className?: string
}

export function TokenIcon({ mark, className = 'h-8 w-8' }: TokenIconProps): ReactElement {
  const { fill, glyph } = TOKEN_MARK_COLORS[mark]
  return (
    <span
      aria-hidden="true"
      // The hairline ring separates the dark XLM coin from a black page and
      // the amber one from a white page; it is the ink at low alpha, so it
      // flips with the theme.
      className={`grid shrink-0 place-items-center rounded-full ring-1 ring-inset ring-neutral-50/15 ${className}`}
      style={{ backgroundColor: fill, color: glyph }}
    >
      {mark === 'xlm' ? (
        <StellarMark className="h-[48%] w-[48%]" />
      ) : (
        <svg viewBox="0 0 24 24" className="h-full w-full">
          {GLYPHS[mark]}
        </svg>
      )}
    </span>
  )
}
