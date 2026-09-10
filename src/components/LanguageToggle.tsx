import type { ReactElement } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { iconButtonClasses } from '../lib/buttonStyles'

/** One-tap locale switch. The label names the language the action will open. */
export function LanguageToggle({ light = false }: { light?: boolean }): ReactElement {
  const { language, toggleLanguage } = useLanguage()
  const next = language === 'en' ? 'tr' : 'en'

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={language === 'en' ? 'Switch to Turkish' : 'Switch to English'}
      title={language === 'en' ? 'Switch to Turkish' : 'Switch to English'}
      className={`${iconButtonClasses({ variant: 'ghost' })} font-mono text-[11px] font-semibold uppercase tracking-[0.08em] ${
        light ? 'text-neutral-700 hover:bg-neutral-950/5 hover:text-neutral-950' : ''
      }`}
    >
      {next.toLocaleUpperCase(language === 'tr' ? 'tr-TR' : 'en-US')}
    </button>
  )
}
