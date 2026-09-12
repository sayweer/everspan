/** Whether to mask amounts on screen, shared by every balance display and persisted like a preference. */
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'everspan:amounts-hidden'

/** The mask shown in place of a real figure while amounts are hidden. */
export const AMOUNT_MASK = '••••••'

function initialHidden(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * One hide/show preference for every balance on screen — the wallet's XLM
 * balance and the portfolio total toggle together, the way a single control
 * would in a banking app, rather than each card guarding its own reader.
 */
export function useHiddenAmounts(): [boolean, () => void] {
  const [hidden, setHidden] = useState(initialHidden)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, hidden ? '1' : '0')
    } catch {
      // The choice still holds for this visit.
    }
  }, [hidden])

  return [
    hidden,
    () => {
      setHidden((current) => !current)
    },
  ]
}
