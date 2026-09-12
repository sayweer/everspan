/** The open/closed boolean every sheet and drawer trigger was hand-rolling on its own. */
import { useState } from 'react'

export interface Disclosure {
  open: boolean
  show: () => void
  hide: () => void
  toggle: () => void
}

/**
 * Not a sheet registry — each caller still owns its own native `<dialog>`
 * (via `BottomSheet`/`SideDrawer`), which already guarantees only one is open
 * at a time. This just stops the six call sites that open one from each
 * writing the same `useState<boolean>` plus two inline setters.
 */
export function useDisclosure(initial = false): Disclosure {
  const [open, setOpen] = useState(initial)
  return {
    open,
    show: () => {
      setOpen(true)
    },
    hide: () => {
      setOpen(false)
    },
    toggle: () => {
      setOpen((current) => !current)
    },
  }
}
