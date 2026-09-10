import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

function declarations(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))
  if (!match) throw new Error(`Theme selector not found: ${selector}`)
  return match[1]
}

function rgb(source: string, variable: string): [number, number, number] {
  const matches = [
    ...source.matchAll(new RegExp(`${variable}:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)`, 'g')),
  ]
  const match = matches.at(-1)
  if (!match) throw new Error(`Theme variable not found: ${variable}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function luminance([r, g, b]: [number, number, number]): number {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const first = luminance(a)
  const second = luminance(b)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

/*
 * Contrast alone cannot answer "can a reader tell these two marks apart" — a
 * teal and an olive can sit at the same luminance and still be obviously
 * different colours, which is exactly the case the figure tones have to hold
 * against the status ones. OKLab is perceptually uniform, so a distance and a
 * hue angle in it mean what they look like.
 */
function oklab([r, g, b]: [number, number, number]): [number, number, number] {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue)
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue)
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function perceptualDistance(a: [number, number, number], b: [number, number, number]): number {
  const [first, second] = [oklab(a), oklab(b)]
  return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2])
}

/* Chroma and hue in OKLab are what let the palette assert its own definition:
   every token has to be a point on the line between the oxblood and white, so
   a chromatic one must sit on the seed's hue and an achromatic one must have
   no hue left to be wrong about. */
function chroma([, a, b]: [number, number, number]): number {
  return Math.hypot(a, b)
}

function hueAngle([, a, b]: [number, number, number]): number {
  return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360
}

function hueDistance(a: [number, number, number], b: [number, number, number]): number {
  const delta = Math.abs(hueAngle(oklab(a)) - hueAngle(oklab(b)))
  return Math.min(delta, 360 - delta)
}


/* The two hues the palette is allowed to spend, as the tests understand them:
   the green a commit takes and the red a reversal takes. Every other token in
   the app has to be a grey. */
const GREEN: [number, number, number] = [21, 128, 61]
const RED: [number, number, number] = [185, 28, 28]

describe('app theme contrast', () => {
  const dark = declarations(':root')
  const light = `${dark}\n${declarations(".surface-app[data-theme='light']")}`
  const site = `${dark}\n${declarations('.surface-site')}`

  it.each([
    ['dark primary text', dark, '--neutral-100', '--neutral-950', 4.5],
    ['dark secondary text', dark, '--neutral-400', '--neutral-950', 4.5],
    ['dark focus ring on card', dark, '--accent-300', '--neutral-900', 3],
    ['dark control boundary on card', dark, '--boundary', '--neutral-900', 3],
    ['dark muted text', dark, '--neutral-500', '--neutral-900', 4.5],
    ['dark quiet text', dark, '--neutral-600', '--neutral-900', 4.5],
    ['dark validation text', dark, '--negative-300', '--neutral-950', 4.5],
    ['light primary text', light, '--neutral-50', '--neutral-950', 4.5],
    ['light secondary text', light, '--neutral-400', '--neutral-950', 4.5],
    ['light focus ring', light, '--accent-400', '--neutral-950', 3],
    ['light control boundary', light, '--boundary', '--neutral-950', 3],
    ['light success text', light, '--positive-100', '--neutral-900', 4.5],
    ['light warning text', light, '--warning-100', '--neutral-900', 4.5],
    ['light danger text', light, '--negative-100', '--neutral-900', 4.5],
    ['site muted text on paper', site, '--neutral-600', '--neutral-50', 4.5],
    ['site muted text on pale card', site, '--neutral-600', '--neutral-200', 4.5],
    ['site control boundary', site, '--boundary', '--neutral-50', 3],
  ])('%s passes its minimum ratio', (_label, source, foreground, background, minimum) => {
    expect(contrast(rgb(source, foreground), rgb(source, background))).toBeGreaterThanOrEqual(
      minimum,
    )
  })

  it('keeps cream text readable on the Everspan ember action', () => {
    expect(contrast(rgb(dark, '--on-accent'), rgb(dark, '--accent-500'))).toBeGreaterThanOrEqual(
      4.5,
    )
  })

  /*
   * The palette spends colour only where the reader is about to act: green
   * commits or acquires, red destroys or reverses. These tests are what stop
   * a future pass either bleeding those two hues into the surface system or
   * quietly collapsing them back onto the colourless accent.
   */
  it.each([
    ['success', 'positive'],
    ['warning', 'warning'],
  ])('%s never lands on the accent', (_label, role) => {
    for (const source of [dark, light]) {
      expect(rgb(source, `--${role}-400`)).not.toEqual(rgb(source, '--accent-400'))
      expect(rgb(source, `--${role}-500`)).not.toEqual(rgb(source, '--accent-500'))
    }
  })

  /*
   * The accent is the ink, so an ordinary action is colourless. A failure that
   * reused it would be indistinguishable from a "Continue" — which is exactly
   * what the previous palette had to live with, and the reason red is now
   * spent on meaning rather than on the brand.
   */
  it('keeps failure on the red rather than on the colourless accent', () => {
    for (const source of [dark, light]) {
      expect(rgb(source, '--negative-500')).not.toEqual(rgb(source, '--accent-500'))
      expect(hueDistance(rgb(source, '--negative-500'), RED)).toBeLessThan(15)
    }
  })

  it.each([
    ['dark', 'dark'],
    ['light', 'light'],
  ])('keeps the commit and the reversal far apart on the %s surface', (surface) => {
    const source = surface === 'dark' ? dark : light
    const [green, red] = [rgb(source, '--positive-500'), rgb(source, '--negative-500')]
    expect(hueDistance(green, red)).toBeGreaterThan(90)
    expect(perceptualDistance(green, red)).toBeGreaterThan(0.1)
  })

  it.each([
    ['dark', 'dark'],
    ['light', 'light'],
  ])('holds white type on both action fills on the %s surface', (surface) => {
    const source = surface === 'dark' ? dark : light
    for (const role of ['positive', 'negative']) {
      expect(contrast(rgb(source, `--on-${role}`), rgb(source, `--${role}-500`))).toBeGreaterThanOrEqual(4.5)
    }
  })
})

/*
 * The figure tones used to give a concept icon its own identity colour, and
 * they were the one place the app spent more than one hue. A two-colour
 * palette cannot pay for that, so the family collapsed to a single brand tone
 * and the icons went back to being told apart by what they are drawings of.
 * The names survive because every call site spells one of them; these tests
 * are what stop a future pass quietly reintroducing four hues under them.
 */
describe('figure tones', () => {
  const dark = declarations(':root')
  const light = `${dark}\n${declarations(".surface-app[data-theme='light']")}`
  const site = `${dark}\n${declarations('.surface-site')}`
  const TONES = ['ember', 'ochre', 'verdigris', 'mulberry'] as const

  it.each([
    ['dark', dark, '--neutral-900'],
    ['light', light, '--neutral-900'],
    ['site', site, '--neutral-50'],
  ])('every tone stays readable on the %s card', (_surface, source, background) => {
    for (const tone of TONES) {
      /* Held to the text bar rather than the 3:1 graphics one: these marks
         carry the meaning of the row they sit in, not just its shape. */
      expect(contrast(rgb(source, `--figure-${tone}`), rgb(source, background))).toBeGreaterThan(4.5)
    }
  })

  it.each([
    ['dark', dark],
    ['light', light],
  ])('resolves to one shared tone on the %s surface', (_surface, source) => {
    const [first, ...rest] = TONES.map((tone) => rgb(source, `--figure-${tone}`))
    for (const tone of rest) expect(tone).toEqual(first)
  })

  it('carries the paper-tuned tones into the marketing route and back out on ink', () => {
    const ink = declarations('.surface-ink')
    for (const tone of TONES) {
      expect(rgb(site, `--figure-${tone}`)).toEqual(rgb(light, `--figure-${tone}`))
      expect(rgb(ink, `--figure-${tone}`)).toEqual(rgb(dark, `--figure-${tone}`))
    }
  })
})

/*
 * The palette's actual promise — a greyscale surface system with exactly two
 * hues spent on meaning. Contrast tests cannot catch a breach of it: a teal
 * with the right luminance passes every ratio above. This is the test that
 * fails the moment a third colour appears anywhere in the theme, which is the
 * one way this palette can be lost by accident.
 */
describe('black-and-white palette', () => {
  /* Below this a token has no colour left to be wrong about; the greyscale
     ramp is generated with a measured chroma of exactly zero, so anything
     above it was written by hand. */
  const ACHROMATIC = 0.02
  const HUED = /^--(positive|negative|on-positive|on-negative)-?/

  it.each([
    [':root'],
    [".surface-app[data-theme='light']"],
    ['.surface-site'],
    ['.surface-ink'],
  ])('paints every %s token grey unless it carries an action', (selector) => {
    const tokens = [...declarations(selector).matchAll(/--([a-z0-9-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)]
    expect(tokens.length).toBeGreaterThan(0)
    for (const [, name, r, g, b] of tokens) {
      const colour: [number, number, number] = [Number(r), Number(g), Number(b)]
      if (!HUED.test(`--${name}`)) {
        expect(chroma(oklab(colour)), `--${name} is not an action, so it may not carry a hue`).toBeLessThan(
          ACHROMATIC,
        )
        continue
      }
      if (chroma(oklab(colour)) < ACHROMATIC) continue
      const nearest = name.startsWith('positive') || name.startsWith('on-positive') ? GREEN : RED
      expect(hueDistance(colour, nearest), `--${name} drifts off its action hue`).toBeLessThan(25)
    }
  })

  it('spends black and white themselves as the ends of the surface ramp', () => {
    const root = declarations(':root')
    expect(rgb(root, '--neutral-950')).toEqual([0, 0, 0])
    expect(rgb(root, '--neutral-50')).toEqual([255, 255, 255])
  })
})
