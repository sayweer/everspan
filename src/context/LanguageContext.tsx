/* eslint-disable react-refresh/only-export-components -- provider and hook share one stable module. */
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { translateUiText, type Language } from '../i18n/translations'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
}

const STORAGE_KEY = 'everspan:language'
const TRANSLATABLE_ATTRIBUTES = ['aria-label', 'title', 'placeholder'] as const
const LanguageContext = createContext<LanguageContextValue | null>(null)

function initialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'tr') return saved
  } catch {
    // Keep the established English interface when storage is unavailable.
  }
  return 'en'
}

function localizeNode(root: Node, language: Language): void {
  if (root.nodeType === Node.TEXT_NODE) {
    const current = root.textContent ?? ''
    const translated = translateUiText(current, language)
    if (translated !== current) root.textContent = translated
    return
  }
  if (!(root instanceof Element)) return

  for (const attribute of TRANSLATABLE_ATTRIBUTES) {
    const current = root.getAttribute(attribute)
    if (!current) continue
    const translated = translateUiText(current, language)
    if (translated !== current) root.setAttribute(attribute, translated)
  }

  for (const child of root.childNodes) localizeNode(child, language)
}

/** Persistent application language plus a bridge for the existing UI copy. */
export function LanguageProvider({ children }: { children: ReactNode }): ReactElement {
  const [language, setLanguage] = useState<Language>(initialLanguage)

  useLayoutEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dataset.language = language
    document.title = translateUiText(document.title, language)
    localizeNode(document.body, language)

    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // The in-memory preference still applies for this visit.
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          localizeNode(mutation.target, language)
          continue
        }
        if (mutation.type === 'characterData') {
          localizeNode(mutation.target, language)
          continue
        }
        for (const node of mutation.addedNodes) localizeNode(node, language)
      }
      document.title = translateUiText(document.title, language)
    })
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
    })
    return () => observer.disconnect()
  }, [language])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((current) => (current === 'en' ? 'tr' : 'en')),
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider.')
  return context
}
