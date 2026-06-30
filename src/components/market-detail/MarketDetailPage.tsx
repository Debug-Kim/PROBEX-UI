'use client'

/**
 * MarketDetailPage
 *
 * This is the 3-column flagship page composition root.
 * change: call useSingleMarketStream(marketId) here once and
 * pass the MergedMarketView down to all three columns.
 *
 * All three children remain unchanged except for receiving the new
 * optional liveView prop — fully backward-compatible.
 *
 */

import { useSingleMarketStream } from '@/hooks/useMarketStream'
import { MarketHeader } from './MarketHeader'
import { MarketCharts } from './MarketCharts'
import { ConsensusPanel } from '@/components/consensus/ConsensusPanel'
import { MarketActivityFeed } from './MarketActivityFeed'
import { MarketThesisPanel } from './MarketThesisPanel'
import { RelatedMarkets } from './RelatedMarkets'
import { TradingDrawer } from '@/components/trading/TradingDrawer'
import { services } from '@/lib/services'
import { asMarketId } from '@/types/branded'

interface MarketDetailPageProps {
  marketId: string
}

export function MarketDetailPage({ marketId }: MarketDetailPageProps) {
  const mid       = asMarketId(marketId)
  const market    = services.markets.peekMarket?.(mid) ?? null
  const consensus = services.consensus.peekConsensus?.(mid as string) ?? null

  // single subscription point for this market
  const liveView = useSingleMarketStream(mid)

  if (!market || !consensus) {
    return (
      <div
        style={{
          padding: 48,
          textAlign: 'center',
          color: 'var(--probex-text-muted)',
        }}
      >
        Market not found.
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Full-width header */}
      <MarketHeader
        market={market}
        consensus={consensus}
 liveView={liveView}
      />

      {/* 3-column body */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '280px 1fr 320px',
          overflow: 'hidden',
        }}
      >
        {/* Left: Consensus Panel */}
        <aside
          style={{
            borderRight: '1px solid var(--probex-border)',
            overflowY: 'auto',
          }}
        >
          <ConsensusPanel
            marketId={mid}
            consensus={consensus}
            // liveScore passed so ConsensusScoreCard stays in sync
 liveScore={liveView?.consensusScore}
 liveConfidence={liveView?.consensusConfidence}
          />
        </aside>

        {/* Center: Charts + Thesis + Activity + Related.
            Block (not flex column) so children keep their natural height and the
            column scrolls top-to-bottom — a flex column would shrink them to fit
            and clip the lower sections. */}
        <main
          style={{
            overflowY: 'auto',
          }}
        >
          <MarketCharts
            market={market}
 liveView={liveView}
          />
          <MarketThesisPanel
            market={market}
            consensus={consensus}
            liveProbability={liveView?.probability}
          />
          <MarketActivityFeed marketId={mid} />
          <RelatedMarkets
            marketId={mid as string}
            segment={market.segment}
            consensus={consensus.score}
          />
        </main>

        {/* Right: Trading Drawer */}
        <aside
          style={{
            borderLeft: '1px solid var(--probex-border)',
            overflowY: 'auto',
          }}
        >
          <TradingDrawer
            market={market}
            // Live probability for trade summary accuracy
 liveProbability={liveView?.probability}
          />
        </aside>
      </div>
    </div>
  )
}
