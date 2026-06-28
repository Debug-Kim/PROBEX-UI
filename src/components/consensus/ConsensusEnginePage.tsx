'use client'

/**
 * ConsensusEnginePage — Prediction Intelligence Engine (flagship)
 * ───────────────────────────────────────────────────────────────
 * The Consensus page now explains markets rather than merely displaying a
 * probability. It composes existing consensus, analytics, market-detail, and
 * research building blocks with a new intelligence layer:
 *
 *   • Market selector            (new)        • Confidence evolution (new chart)
 *   • Live confidence indicator  (ConfidenceMeter reuse)
 *   • Intelligence summary       (new)        • Recommendation engine (reused output)
 *   • Consensus timeline         (ConsensusHistory reuse)
 *   • Institutional vs retail    (BiasBreakdown reuse)
 *   • Explainability             (new)        • Historical snapshots (new)
 *   • Related markets            (RelatedMarkets reuse)
 *   • Research integration       (ResearchReportCard reuse)
 */

import { useMemo, useState } from 'react'
import { services }            from '@/lib/services'
import { useMarketStore }      from '@/store/marketStore'
import { useSingleMarketStream } from '@/hooks/useMarketStream'
import { asMarketId }          from '@/types/branded'
import { getIntelligenceSummary, getExplainabilityDrivers } from '@/mock/intelligence'

import { ConfidenceMeter }     from '@/components/markets/ConfidenceMeter'
import { AnalyticsCard }       from '@/components/analytics/shared'
import { EmptyState }          from '@/components/ui/EmptyState'
import { ConsensusHistory }    from './ConsensusHistory'
import { BiasBreakdown }       from './BiasBreakdown'
import { RelatedMarkets }      from '@/components/market-detail/RelatedMarkets'

import { MarketSelector }        from './MarketSelector'
import { IntelligenceSummary }   from './IntelligenceSummary'
import { RecommendationCard }    from './RecommendationCard'
import { ExplainabilityPanel }   from './ExplainabilityPanel'
import { ConfidenceEvolution }   from './ConfidenceEvolution'
import { HistoricalSnapshots }   from './HistoricalSnapshots'
import { ConsensusResearch }     from './ConsensusResearch'

export function ConsensusEnginePage() {
  const firstId = (services.markets.peekMarkets?.()?.data[0]?.id as string) ?? ''
  const [marketId, setMarketId] = useState<string>(() => {
    const sel = useMarketStore.getState().selectedMarketId
    return (sel as string | null) || firstId
  })

  const market    = services.markets.peekMarket?.(marketId) ?? undefined
  const consensus = services.consensus.peekConsensus?.(marketId) ?? undefined
  const view      = useSingleMarketStream(asMarketId(marketId))

  const summary = useMemo(
    () => (market && consensus && view ? getIntelligenceSummary(market, consensus, view.recommendation) : null),
    [market, consensus, view],
  )
  const drivers = useMemo(() => (consensus ? getExplainabilityDrivers(consensus) : []), [consensus])

  return (
    <div className="page-container flex flex-col gap-4 pb-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--probex-text-primary)' }}>Consensus Engine</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--probex-text-muted)' }}>
            The prediction intelligence layer — understand why markets move, not just where the price sits.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <MarketSelector markets={services.markets.peekMarkets?.()?.data ?? []} value={marketId} onSelect={setMarketId} />
          {consensus && view && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0" style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border-default)' }}>
              <span className="live-dot" aria-hidden="true" />
              <span className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>Live confidence</span>
              <ConfidenceMeter confidence={consensus.predictionConfidence} liveConfidence={view.consensusConfidence} size="sm" showLabel />
            </div>
          )}
        </div>
      </div>

      {(!market || !consensus || !view || !summary) ? (
        <EmptyState
          size="lg"
          title="Select a market"
          description="Choose a market above to see its full consensus intelligence breakdown."
        />
      ) : (
        <>
          {/* Intelligence summary (hero) */}
          <IntelligenceSummary summary={summary} consensus={consensus} />

          {/* Timeline + recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ConsensusHistory marketId={marketId} baseScore={consensus.score} />
            </div>
            <RecommendationCard
              recommendation={view.recommendation}
              consensusScore={view.consensusScore}
              probability={view.probability}
              isLive={view.isLive}
            />
          </div>

          {/* Explainability + institutional vs retail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ExplainabilityPanel drivers={drivers} />
            <AnalyticsCard title="Institutional vs Retail" subtitle="Smart money vs retail positioning and alignment">
              <BiasBreakdown consensus={consensus} />
            </AnalyticsCard>
          </div>

          {/* Confidence evolution + historical snapshots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ConfidenceEvolution marketId={marketId} baseConfidence={consensus.predictionConfidence} />
            <HistoricalSnapshots marketId={marketId} />
          </div>

          {/* Related markets + research */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RelatedMarkets marketId={marketId} segment={market.segment} consensus={consensus.score} />
            <ConsensusResearch marketId={marketId} segment={market.segment} />
          </div>
        </>
      )}
    </div>
  )
}
