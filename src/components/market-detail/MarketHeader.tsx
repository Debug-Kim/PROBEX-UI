'use client'

/**
 * MarketHeader
 *
 * MarketDetailPage now derives a MergedMarketView and passes live values
 * down via props. MarketHeader itself remains a pure presentational
 * component; no store subscriptions added here.
 *
 * New props (all optional / backward-compatible):
 *   - liveView?: MergedMarketView
 *
 * Layout and styling unchanged from.
 */

import { ConsensusBadge } from '@/components/markets/ConsensusBadge'
import { ProbabilityDisplay } from '@/components/markets/ProbabilityDisplay'
import { SentimentIndicator } from '@/components/markets/SentimentIndicator'
import { LiveIndicator } from '@/components/live/LiveIndicator'
import type { Market } from '@/types/market'
import type { ConsensusState } from '@/types/consensus'
import type { MergedMarketView } from '@/lib/realtime/types'

interface MarketHeaderProps {
  market: Market
  consensus: ConsensusState
 liveView?: MergedMarketView | null
}

export function MarketHeader({
  market,
  consensus,
  liveView,
}: MarketHeaderProps) {
 // overlay live values; fall back to static
  const probability = liveView?.probability ?? market.probability
  const consensusScore = liveView?.consensusScore ?? consensus.score
  const isLive = liveView?.isLive ?? false
  const deltaBps = liveView?.deltaBps ?? undefined

  return (
    <header
      style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid var(--probex-border)',
        backgroundColor: 'var(--probex-surface)',
      }}
    >
      {/* Title row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h1
          style={{
            flex: 1,
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--probex-text-primary)',
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          {market.question}
        </h1>
 {isLive && <LiveIndicator variant="pill" />}
      </div>

      {/* Metrics row — Consensus dominant */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        {/* Consensus — dominant */}
        <ConsensusBadge
          score={consensusScore}
          size="lg"
 isLive={isLive}
        />

        <SentimentIndicator bias={consensus.bias} />

        {/* Probability — secondary */}
        <ProbabilityDisplay
          probability={probability}
 deltaBps={deltaBps}
 isLive={isLive}
          size="lg"
        />

        {/* Resolution date */}
        <span
          style={{
            fontSize: 12,
            color: 'var(--probex-text-muted)',
            marginLeft: 'auto',
          }}
        >
          Resolves {new Date(market.resolutionDate).toLocaleDateString()}
        </span>
      </div>
    </header>
  )
}
