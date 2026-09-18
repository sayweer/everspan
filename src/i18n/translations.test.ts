import { describe, expect, it } from 'vitest'
import { EN_TO_TR, translateUiText } from './translations'

describe('UI translations', () => {
  it('translates exact copy in both directions', () => {
    expect(translateUiText('Launch App', 'tr')).toBe('Uygulamayı Aç')
    expect(translateUiText('Uygulamayı Aç', 'en')).toBe('Launch App')
  })

  it('preserves layout whitespace around JSX text', () => {
    expect(translateUiText('\n  Home  ', 'tr')).toBe('\n  Ana sayfa  ')
  })

  it('translates dynamic balance labels without touching the value', () => {
    expect(translateUiText('Available: 12.5 SY', 'tr')).toBe('Kullanılabilir: 12.5 SY')
    expect(translateUiText('Kullanılabilir: 12.5 SY', 'en')).toBe('Available: 12.5 SY')
  })

  it('localizes relative times and dates rendered by shared formatters', () => {
    expect(translateUiText('5m ago', 'tr')).toBe('5 dk önce')
    expect(translateUiText('Sep 10, 17:30 · step 1 of 2', 'tr')).toBe(
      'Eyl 10, 17:30 · 2 adımın 1.si',
    )
  })

  it('leaves protocol symbols and unknown copy unchanged', () => {
    expect(translateUiText('PT + YT', 'tr')).toBe('PT + YT')
  })

  /* The reverse map is built from values, so two keys sharing a Turkish string
     would silently translate one of them back to the wrong English. Checked
     over the whole table rather than a sample: the two collisions this caught
     in practice were both introduced by adding a page's worth of copy at once,
     which is exactly when nobody is comparing against the other 800 entries. */
  it('keeps every Turkish string unique so switching back to English is exact', () => {
    const offenders = Object.keys(EN_TO_TR).filter(
      (english) => translateUiText(translateUiText(english, 'tr'), 'en') !== english,
    )
    expect(offenders).toEqual([])
  })
})
