/** Notification centre. Empty shell for now — no notification data model exists yet. */
import type { ReactElement } from 'react'
import { BottomSheet } from './BottomSheet'
import { BellIcon } from './icons'

interface NotificationsSheetProps {
  open: boolean
  onClose: () => void
}

export function NotificationsSheet({ open, onClose }: NotificationsSheetProps): ReactElement {
  return (
    <BottomSheet open={open} onClose={onClose} title="Notifications">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-neutral-950/40 px-4 py-10 text-center">
        <BellIcon className="h-6 w-6 text-neutral-500" />
        <div>
          <p className="text-sm font-medium text-neutral-200">No notifications yet</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            Updates about your transactions and account will appear here.
          </p>
        </div>
      </div>
    </BottomSheet>
  )
}
