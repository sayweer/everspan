/** A panel that slides in from the left edge — the phone's answer to a nav rail. */
import { useEffect, useRef, type ReactElement, type ReactNode } from 'react'
import { IconButton } from './Button'
import { XIcon } from './icons'

interface SideDrawerProps {
  open: boolean
  onClose: () => void
  /** Heading for the drawer; also its accessible name. */
  title: string
  children: ReactNode
}

/**
 * The same primitive as `BottomSheet`, entering from a different edge: a native
 * `<dialog>` opened with `showModal()`, which brings the focus trap, the inert
 * background, Escape-to-close and top-layer stacking with it.
 *
 * Kept as a sibling rather than a `side` prop on the sheet: the two differ in
 * more than a transform — this one owns the full height, scrolls its own
 * content, and has no grabber, because a drawer does not read as something you
 * flick back down. What they share is the contract, so a reader of either
 * component already knows how the other opens and closes.
 *
 * Like the sheet, there is no closing animation: playing one means holding the
 * dialog open until `animationend` and tracking a third state between open and
 * closed, and the reader has already moved on by then.
 */
export function SideDrawer({ open, onClose, title, children }: SideDrawerProps): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    // `showModal()` makes the background inert to pointers but does not stop it
    // scrolling behind the drawer on iOS, which is the tell that separates a
    // web overlay from a native one.
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        // A click on a child never has the dialog itself as its target, so this
        // is the whole backdrop test.
        if (event.target === dialogRef.current) onClose()
      }}
      className="m-0 mr-auto h-full max-h-none w-[min(21rem,86vw)] max-w-none rounded-r-3xl border-r border-hairline bg-neutral-900 p-0 text-neutral-100 backdrop:bg-neutral-950/70 motion-safe:animate-drawer-in"
    >
      <div className="flex h-full flex-col overflow-y-auto overscroll-contain pl-[env(safe-area-inset-left)] pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
          <h2 className="text-base font-medium tracking-[-0.01em]">{title}</h2>
          <IconButton
            variant="ghost"
            label="Close"
            icon={<XIcon className="h-5 w-5" />}
            onClick={onClose}
          />
        </div>
        <div className="flex-1 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </dialog>
  )
}
