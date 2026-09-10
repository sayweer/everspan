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

const OBSERVED: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
  attributes: true,
  attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
}

/** Persistent application language plus a bridge for the existing UI copy. */
export function LanguageProvider({ children }: { children: ReactNode }): ReactElement {
  const [language, setLanguage] = useState<Language>(initialLanguage)

  useLayoutEffect(() => {
    /*
     * This observer rewrites the DOM it is watching, so every write it makes
     * has to happen with the observer switched off. Left connected it feeds
     * itself: `document.title = …` re-writes the title element's text node
     * even when the string is identical — the DOM spec queues a characterData
     * record for the assignment, not for a change in value — so the callback
     * re-entered forever and starved the main thread. Because this runs in a
     * layout effect, that happened before the first paint and the app shipped
     * a blank page.
     *
     * `disconnect()` also empties the pending record queue, which is what
     * discards the records our own writes just produced.
     */
    const observer = new MutationObserver((mutations) => {
      write(() => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' || mutation.type === 'characterData') {
            localizeNode(mutation.target, language)
            continue
          }
          for (const node of mutation.addedNodes) localizeNode(node, language)
        }
        localizeTitle()
      })
    })

    function write(mutate: () => void): void {
      observer.disconnect()
      try {
        mutate()
      } finally {
        observer.observe(document.documentElement, OBSERVED)
      }
    }

    function localizeTitle(): void {
      const translated = translateUiText(document.title, language)
      if (translated !== document.title) document.title = translated
    }

    write(() => {
      document.documentElement.lang = language
      document.documentElement.dataset.language = language
      localizeTitle()
      localizeNode(document.body, language)
    })

    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // The in-memory preference still applies for this visit.
    }

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
