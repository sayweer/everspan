/**
 * Positions tab: what you hold, and the door to opening something new. The
 * two used to be separate top-level destinations (Portfolio, Earn) — now
 * they are one segmented choice, because "what do I have" and "what can I
 * start" are the same question a reader asks when they land here.
 */
import type { ReactElement } from 'react'
import type { Portfolio, MaturityPosition } from '../hooks/usePortfolio'
import type { MaturityPool } from '../hooks/usePools'
import type { AppError } from '../types'
import { PortfolioPanel } from './PortfolioPanel'
import { MaturityPanel } from './MaturityPanel'
import { LpPositions } from './LpPositions'
import { EarnPanel } from './EarnPanel'
import type { EarnStrategy } from './HomePanel'
import { TabToggle } from './forms'

export type PositionsSegment = 'held' | 'open'

interface PositionsPanelProps {
  segment: PositionsSegment
  onSegmentChange: (segment: PositionsSegment) => void
  address: string
  isWrongNetwork: boolean
  portfolio: Portfolio
  positions: MaturityPosition[]
  pools: MaturityPool[]
  poolsLoading: boolean
  loading: boolean
  error: AppError | null
  liveRate: bigint | null
  strategy: EarnStrategy
  onStrategyChange: (strategy: EarnStrategy) => void
  maturity: bigint | null
  onMaturityChange: (maturity: bigint) => void
  onRefresh: () => void
  onSuccess: () => void
  onManagePool: (maturity: bigint) => void
  onConvert: () => void
}

export function PositionsPanel({
  segment,
  onSegmentChange,
  address,
  isWrongNetwork,
  portfolio,
  positions,
  pools,
  poolsLoading,
  loading,
  error,
  liveRate,
  strategy,
  onStrategyChange,
  maturity,
  onMaturityChange,
  onRefresh,
  onSuccess,
  onManagePool,
  onConvert,
}: PositionsPanelProps): ReactElement {
  return (
    <section id="panel-positions" role="tabpanel" aria-label="Positions" className="space-y-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-300">
        Positions
      </p>

      <TabToggle
        label="Your positions or open a new one"
        options={[
          { id: 'held', label: 'Your positions' },
          { id: 'open', label: 'Open a position' },
        ]}
        active={segment}
        onChange={(id) => {
          onSegmentChange(id as PositionsSegment)
        }}
      />

      {segment === 'held' ? (
        <div className="space-y-6">
          <PortfolioPanel
            address={address}
            portfolio={portfolio}
            loading={loading}
            error={error}
            liveRate={liveRate}
            onRefresh={onRefresh}
          />
          {!loading && !error ? (
            <>
              <MaturityPanel
                address={address}
                positions={positions}
                rateInfo={portfolio.rateInfo}
                isWrongNetwork={isWrongNetwork}
                onSuccess={onSuccess}
              />
              <LpPositions pools={pools} liveRate={liveRate} onManage={onManagePool} />
            </>
          ) : null}
        </div>
      ) : (
        <EarnPanel
          strategy={strategy}
          onStrategyChange={onStrategyChange}
          address={address}
          isWrongNetwork={isWrongNetwork}
          pools={pools}
          poolsLoading={poolsLoading}
          positions={positions}
          underlyingBalance={portfolio.underlying}
          syBalance={portfolio.sy}
          liveRate={liveRate}
          tradeMaturity={maturity}
          poolMaturity={maturity}
          onMaturityChange={onMaturityChange}
          onSuccess={onSuccess}
          onConvert={onConvert}
        />
      )}
    </section>
  )
}
