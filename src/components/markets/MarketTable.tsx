'use client'

/**
 * MarketTable
 *
 * Table view for MarketsView (list mode). Each row calls
 * useSingleMarketStream for its own marketId so only the affected row
 * re-renders on a tick — not the whole table.
 *
 * The live-enabled row is extracted as MarketTableRow to isolate the
 * per-row hook call while keeping the table shell free of hook loops.
 *
 */

import Link from 'next/link'
import { ConsensusBadge } from './ConsensusBadge'
import { ProbabilityDisplay } from './ProbabilityDisplay'
import { SentimentIndicator } from './SentimentIndicator'
import { ConfidenceMeter } from './ConfidenceMeter'
import { WatchlistButton } from './WatchlistButton'
import { LiveIndicator } from '@/components/live/LiveIndicator'
import { useSingleMarketStream } from '@/hooks/useMarketStream'
import { ROUTES } from '@/config/constants'
import type { Market } from '@/types/market'
import type { ConsensusState } from '@/types/consensus'
import type { MarketId } from '@/types/branded'

// ── Per-row component (isolated hook per row) ─────────────────────────────────

interface MarketTableRowProps {
  market: Market
  consensus: ConsensusState
  onClick?: (market: Market) => void
}

function MarketTableRow({ market, consensus, onClick }: MarketTableRowProps) {
 // per-row subscription — only this row re-renders on its tick
  const liveView = useSingleMarketStream(market.id as MarketId)

  const probability = liveView?.probability ?? market.probability
  const consensusScore = liveView?.consensusScore ?? consensus.score
  const consensusConfidence = liveView?.consensusConfidence ?? consensus.predictionConfidence
  const isLive = liveView?.isLive ?? false
  const deltaBps = liveView?.deltaBps ?? undefined

  return (
    <tr
      onClick={onClick ? () => onClick(market) : undefined}
      style={{ borderBottom: '1px solid var(--probex-border)', cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Market question */}
      <td
        style={{
          padding: '11px 16px',
          fontSize: 13,
          color: 'var(--probex-text-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href={`${ROUTES.MARKETS}/${market.id as string}`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            {market.question}
          </Link>
 {isLive && <LiveIndicator variant="dot" />}
        </div>
      </td>

      {/* Consensus — dominant */}
      <td style={{ padding: '11px 12px' }}>
        <ConsensusBadge
          score={consensusScore}
          size="sm"
          isLive={isLive}
        />
      </td>

      {/* Sentiment */}
      <td style={{ padding: '11px 12px' }}>
        <SentimentIndicator
          bias={consensus.bias}
          liveBias={liveView?.consensusBias}
          size="sm"
        />
      </td>

      {/* Probability — secondary */}
      <td
        style={{
          padding: '11px 12px',
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <ProbabilityDisplay
          probability={probability}
          deltaBps={deltaBps}
          isLive={isLive}
          size="sm"
        />
      </td>

      {/* Confidence */}
      <td style={{ padding: '11px 12px' }}>
        <ConfidenceMeter
          confidence={consensus.predictionConfidence}
          liveConfidence={consensusConfidence}
          size="sm"
        />
      </td>

      {/* Volume */}
      <td
        style={{
          padding: '11px 12px',
          textAlign: 'right',
          fontSize: 12,
          color: 'var(--probex-text-secondary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatVolume(liveView?.volume ?? market.volume)}
      </td>

      {/* Watchlist */}
      <td style={{ padding: '11px 12px', textAlign: 'center' }}>
        <WatchlistButton marketId={market.id} />
      </td>
    </tr>
  )
}

// ── Table shell ───────────────────────────────────────────────────────────────

interface MarketTableProps {
  markets: Market[]
  consensusMap: Record<string, ConsensusState>
  /** Optional row-click handler. Navigation also works via the title Link. */
  onMarketClick?: (market: Market) => void
}

export function MarketTable({ markets, consensusMap, onMarketClick }: MarketTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'auto',
        }}
        aria-label="Bitcoin prediction markets"
      >
        <thead>
          <tr
            style={{
              borderBottom: '2px solid var(--probex-border)',
              backgroundColor: 'var(--probex-surface)',
            }}
          >
            {[
              { label: 'Market', align: 'left' as const },
              { label: 'Consensus', align: 'left' as const },
              { label: 'Sentiment', align: 'left' as const },
              { label: 'Probability', align: 'right' as const },
              { label: 'Confidence', align: 'left' as const },
              { label: 'Volume', align: 'right' as const },
              { label: '', align: 'center' as const },
            ].map((col) => (
              <th
                key={col.label}
                scope="col"
                style={{
                  padding: '9px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--probex-text-muted)',
                  textAlign: col.align,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {markets.map((market) => {
            const consensus = consensusMap[market.id as string]
            if (!consensus) return null
            return (
              <MarketTableRow
                key={market.id as string}
                market={market}
                consensus={consensus}
                {...(onMarketClick ? { onClick: onMarketClick } : {})}
              />
            )
          })}
        </tbody>
      </table>

      {markets.length === 0 && (
        <div
          style={{
            padding: '48px 0',
            textAlign: 'center',
            color: 'var(--probex-text-muted)',
            fontSize: 14,
          }}
        >
          No markets match your filters.
        </div>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(Math.round(v))
}
