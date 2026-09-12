import { describe, expect, it } from 'vitest'
import { translateUiText } from './translations'

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
})
