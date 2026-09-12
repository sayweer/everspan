/** Your transactions: whatever is in flight right now, plus your confirmed history. */
import type { ReactElement } from 'react'
import { explorerTxUrl } from '../config'
import { useTransactionSafety } from '../context/TransactionSafetyContext'
import type { UseProtocolEventsResult } from '../hooks/useProtocolEvents'
import { ActivityFeed } from './ActivityFeed'
import { BottomSheet } from './BottomSheet'
import { ExternalLinkIcon, Spinner } from './icons'

interface TransactionsSheetProps {
  open: boolean
  onClose: () => void
  address: string | null
  liveRate: bigint | null
  personalActivity: UseProtocolEventsResult
}

/**
 * The full recovery/unlock flow for a stuck transaction lives in
 * `TransactionSafetyBanner`, which is already visible app-wide whenever one is
 * active — this card only surfaces the same fact inside this screen, it does
 * not duplicate that logic.
 */
function PendingCard(): ReactElement | null {
  const { trackedTransaction } = useTransactionSafety()
  if (!trackedTransaction) return null

  const isInFlight = trackedTransaction.state === 'in_flight'
  const phaseText = !isInFlight
    ? 'Outcome could not be verified yet.'
    : trackedTransaction.phase === 'building'
      ? 'Preparing the transaction…'
      : trackedTransaction.phase === 'signing'
        ? 'Waiting for your wallet…'
        : 'Waiting for Stellar confirmation…'

  return (
    <div className="mb-4 rounded-xl border border-warning-500/30 bg-warning-500/10 p-3.5">
      <div className="flex items-center gap-2.5">
        <Spinner className="h-4 w-4 shrink-0 text-warning-400" />
        <span className="text-sm font-medium text-warning-100">{trackedTransaction.label}</span>
      </div>
      <p className="mt-1.5 text-xs text-warning-200/80">{phaseText}</p>
      {trackedTransaction.hash && (
        <a
          href={explorerTxUrl(trackedTransaction.hash)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-warning-100 underline underline-offset-2"
        >
          View on Stellar Expert
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}

export function TransactionsSheet({
  open,
  onClose,
  address,
  liveRate,
  personalActivity,
}: TransactionsSheetProps): ReactElement {
  return (
    <BottomSheet open={open} onClose={onClose} title="Transactions">
      <PendingCard />
      <div className="max-h-[60vh] overflow-y-auto">
        <ActivityFeed
          events={personalActivity.events}
          address={address ?? undefined}
          liveRate={liveRate}
          loading={personalActivity.loading}
          error={personalActivity.error}
          onRetry={personalActivity.retry}
        />
      </div>
    </BottomSheet>
  )
}
