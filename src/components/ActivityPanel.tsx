/** Activity tab: what the connected wallet did, or everything the protocol published. */
import type { ReactElement } from 'react'
import type { ProtocolEvent } from '../lib/events'
import type { AppError } from '../types'
import { ActivityFeed } from './ActivityFeed'
import { ConnectPrompt } from './ConnectPrompt'
import { TabToggle } from './forms'

export type ActivityScope = 'yours' | 'protocol'

interface ActivityPanelProps {
  scope: ActivityScope
  onScopeChange: (scope: ActivityScope) => void
  address: string | null
  liveRate: bigint | null
  personalEvents: ProtocolEvent[]
  personalLoading: boolean
  personalError: AppError | null
  onRetryPersonal: () => void
  protocolEvents: ProtocolEvent[]
  protocolLoading: boolean
  protocolError: AppError | null
  onRetryProtocol: () => void
}

export function ActivityPanel({
  scope,
  onScopeChange,
  address,
  liveRate,
  personalEvents,
  personalLoading,
  personalError,
  onRetryPersonal,
  protocolEvents,
  protocolLoading,
  protocolError,
  onRetryProtocol,
}: ActivityPanelProps): ReactElement {
  return (
    <section id="panel-activity" role="tabpanel" aria-label="Activity" className="space-y-6">
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-300">
          Activity
        </p>
        <h1
          data-panel-heading
          tabIndex={-1}
          className="mt-3 text-3xl font-medium tracking-[-0.045em] text-neutral-50 outline-none sm:text-4xl"
        >
          Every action, confirmed.
        </h1>
      </header>

      <TabToggle
        label="Your activity or protocol activity"
        options={[
          { id: 'yours', label: 'Your activity' },
          { id: 'protocol', label: 'Protocol activity' },
        ]}
        active={scope}
        onChange={(id) => {
          onScopeChange(id as ActivityScope)
        }}
      />

      {scope === 'yours' && address === null ? (
        <ConnectPrompt
          tab="activity"
          embedded
          message="Connect a Testnet wallet to see your confirmed actions."
        />
      ) : scope === 'yours' ? (
        <ActivityFeed
          events={personalEvents}
          address={address ?? undefined}
          liveRate={liveRate}
          loading={personalLoading}
          error={personalError}
          onRetry={onRetryPersonal}
        />
      ) : (
        <ActivityFeed
          events={protocolEvents}
          liveRate={liveRate}
          loading={protocolLoading}
          error={protocolError}
          onRetry={onRetryProtocol}
        />
      )}
    </section>
  )
}
