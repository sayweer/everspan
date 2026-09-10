/** The drawer's handle: three bars that fold into a cross while it is open. */
import type { ReactElement } from 'react'
import { iconButtonClasses } from '../lib/buttonStyles'

interface MenuButtonProps {
  open: boolean
  onClick: () => void
}

/*
 * Drawn from three spans rather than swapped between two icons. A swap has no
 * intermediate state, so the control reads as a label that changed; folding the
 * same three bars into the cross is what tells the reader the menu they just
 * opened is the thing this button still holds.
 *
 * The bars converge on the middle line — 7px is half the 14px span between the
 * outer two — so the rotation happens around a shared centre instead of each
 * bar pivoting in its own place.
 */
const BAR = 'absolute left-0 block h-0.5 w-full rounded-full bg-current'
const MOVE = 'transition-transform duration-200 ease-spring motion-reduce:transition-none'

export function MenuButton({ open, onClick }: MenuButtonProps): ReactElement {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={open ? 'Close menu' : 'Open menu'}
      onClick={onClick}
      className={`${iconButtonClasses({ variant: 'ghost' })} -ml-2`}
    >
      <span aria-hidden="true" className="relative block h-[14px] w-5">
        <span className={`${BAR} ${MOVE} top-0 ${open ? 'translate-y-[6px] rotate-45' : ''}`} />
        <span
          className={`${BAR} top-1/2 -translate-y-1/2 transition-opacity duration-150 motion-reduce:transition-none ${
            open ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span className={`${BAR} ${MOVE} bottom-0 ${open ? '-translate-y-[6px] -rotate-45' : ''}`} />
      </span>
    </button>
  )
}
