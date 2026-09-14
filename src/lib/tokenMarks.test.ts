import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { TOKEN_MARK_COLORS } from './tokenMarks'

type Rgb = [number, number, number]

const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

function hex(value: string): Rgb {
  const n = Number.parseInt(value.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Every value a token takes across the stylesheet's theme blocks. */
function tokenValues(name: string): Rgb[] {
  return [...css.matchAll(new RegExp(`--${name}:\\s*(\\d+) (\\d+) (\\d+);`, 'g'))].map(
    (match) => [Number(match[1]), Number(match[2]), Number(match[3])],
  )
}

function linear(channel: number): number {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function contrast(a: Rgb, b: Rgb): number {
  const lum = ([r, g, bl]: Rgb): number => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(bl)
  const [x, y] = [lum(a), lum(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

function oklab([r, g, b]: Rgb): Rgb {
  const [red, green, blue] = [linear(r), linear(g), linear(b)]
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue)
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue)
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function hueDistance(a: Rgb, b: Rgb): number {
  const angle = ([, x, y]: Rgb): number => ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
  const delta = Math.abs(angle(oklab(a)) - angle(oklab(b)))
  return Math.min(delta, 360 - delta)
}

function chroma([, a, b]: Rgb): number {
  return Math.hypot(a, b)
}

describe('token marks', () => {
  it('keeps every glyph readable on its coin', () => {
    for (const { fill, glyph } of Object.values(TOKEN_MARK_COLORS)) {
      expect(contrast(hex(fill), hex(glyph))).toBeGreaterThanOrEqual(3)
    }
  })

  it('never lands a coloured coin on the green or red that carry meaning', () => {
    const actions = [...tokenValues('positive-400'), ...tokenValues('negative-400')]
    expect(actions.length).toBeGreaterThan(0)
    for (const { fill } of Object.values(TOKEN_MARK_COLORS)) {
      const coin = hex(fill)
      // A near-neutral coin (XLM's graphite) has no hue to be confused by.
      if (chroma(oklab(coin)) < 0.04) continue
      for (const action of actions) {
        expect(hueDistance(coin, action)).toBeGreaterThanOrEqual(30)
      }
    }
  })
})
