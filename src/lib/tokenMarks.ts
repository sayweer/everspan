/**
 * Asset colours for token marks — the coin a balance or position is drawn as.
 *
 * These are not theme tokens and do not live in `src/index.css`: the surface
 * stays black and white, and green and red stay the only hues that mean
 * something. A token mark is identity, the way a coin logo in an exchange app
 * is, so its colour belongs to the asset rather than to the interface.
 * `tokenMarks.test.ts` keeps every fill a clear hue away from both action
 * colours and every glyph readable on its coin.
 */
export type TokenMark = 'xlm' | 'musdy' | 'principal' | 'yield' | 'liquidity'

export const TOKEN_MARK_COLORS: Record<TokenMark, { fill: string; glyph: string }> = {
  xlm: { fill: '#1E2127', glyph: '#FFFFFF' },
  musdy: { fill: '#2F6BEF', glyph: '#FFFFFF' },
  principal: { fill: '#7A48E0', glyph: '#FFFFFF' },
  yield: { fill: '#F2A93B', glyph: '#2A1700' },
  liquidity: { fill: '#0E8FBF', glyph: '#FFFFFF' },
}

/** The mark for a market's underlying asset. */
export function underlyingMark(symbol: string): TokenMark {
  return symbol === 'XLM' ? 'xlm' : 'musdy'
}
