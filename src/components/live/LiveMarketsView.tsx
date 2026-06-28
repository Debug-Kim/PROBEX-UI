'use client'

/**
 * LiveMarketsView
 *
 * Composition root for /dashboard/live.
 * Renders:
 *   - PageHeader with ConnectionStatusBadge
 *   - LiveTicker strip
 *   - Sortable live markets table (all 30 Bitcoin markets)
 *   - LivePauseControl
 *
 * Uses useMarketStream to get MergedMarketView for all markets.
 * Each LiveMarketRow only re-renders when its own market's data changes.
 */

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConnectionStatusBadge } from './ConnectionStatusBadge'
import { LiveTicker } from './LiveTicker'
import { LivePauseControl } from './LivePauseControl'
import { LiveMarketRow } from './LiveMarketRow'
import { useMarketStream } from '@/hooks/useMarketStream'
import { useGlobalStream } from '@/hooks/useGlobalStream'
import { MOCK_MARKETS } from '@/mock/markets'
import { ROUTES } from '@/config/constants'
import type { MarketId } from '@/types/branded'
import type { MergedMarketView } from '@/lib/realtime/types'

type SortKey = 'consensus' | 'probability' | 'edge' | 'recommendation'
type SortDir = 'asc' | 'desc'

function sortViews(
  views: MergedMarketView[],
  key: SortKey,
  dir: SortDir,
): MergedMarketView[] {
  const mult = dir === 'asc' ? 1 : -1
  return [...views].sort((a, b) => {
    switch (key) {
      case 'consensus':
        return mult * (a.consensusScore - b.consensusScore)
      case 'probability':
        return mult * (a.probability - b.probability)
      case 'edge':
        return mult * (a.edge - b.edge)
      case 'recommendation': {
        const order = [
          'strong_buy_yes',
          'buy_yes',
          'hold',
          'buy_no',
          'strong_buy_no',
        ]
        return (
          mult *
          (order.indexOf(a.recommendation.level) -
            order.indexOf(b.recommendation.level))
        )
      }
    }
  })
}

const ALL_MARKET_IDS = MOCK_MARKETS.map((m) => m.id as MarketId)

export function LiveMarketsView() {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>('consensus')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const mergedMap = useMarketStream(ALL_MARKET_IDS)
  const { consensusScore, participation, isLive } = useGlobalStream()

  const sortedViews = useMemo(() => {
    const views = Array.from(mergedMap.values())
    return sortViews(views, sortKey, sortDir)
  }, [mergedMap, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function handleSelectMarket(id: string) {
    router.push(`${ROUTES.MARKETS}/${id}`)
  }

  function SortHeader({
    col,
    label,
    align = 'right',
  }: {
    col: SortKey
    label: string
    align?: 'left' | 'right' | 'center'
  }) {
    const active = sortKey === col
    return (
      <th
        scope="col"
        aria-sort={
          active ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'
        }
        onClick={() => handleSort(col)}
        style={{
          padding: '10px 12px',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: active
            ? 'var(--probex-primary)'
            : 'var(--probex-text-muted)',
          textAlign: align,
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          borderBottom: '1px solid var(--probex-border)',
        }}
      >
        {label}
        {active && (
          <span aria-hidden="true" style={{ marginLeft: 4 }}>
            {sortDir === 'desc' ? '↓' : '↑'}
          </span>
        )}
      </th>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        minHeight: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '24px 24px 0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <PageHeader
            title="Live Markets"
            subtitle="Real-time Bitcoin prediction market intelligence"
          />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingTop: 4,
          }}
        >
          <LivePauseControl />
          <ConnectionStatusBadge variant="full" />
        </div>
      </div>

      {/* Global stats row */}
      <div
        style={{
          padding: '12px 24px',
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <StatPill
          label="Global Consensus"
          value={`${(consensusScore * 100).toFixed(0)}`}
          live={isLive}
          valueColor="var(--probex-primary)"
        />
        <StatPill
          label="Participation"
          value={`${(participation * 100).toFixed(0)}%`}
          live={isLive}
        />
        <StatPill
          label="Markets"
          value={String(sortedViews.length)}
          live={false}
        />
      </div>

      {/* Ticker */}
      <LiveTicker />

      {/* Markets table */}
      <div
        style={{
          padding: '0 24px 24px',
          overflowX: 'auto',
          flex: 1,
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
          aria-label="Live Bitcoin prediction markets"
        >
          <thead>
            <tr>
              <th
                scope="col"
                style={{
                  padding: '10px 16px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--probex-text-muted)',
                  textAlign: 'left',
                  borderBottom: '1px solid var(--probex-border)',
                  width: '40%',
                }}
              >
                Market
              </th>
              <SortHeader col="consensus" label="Consensus" />
              <SortHeader col="probability" label="Probability" />
              <SortHeader col="edge" label="Edge" />
              <SortHeader col="recommendation" label="Signal" align="center" />
              <th
                scope="col"
                style={{
                  padding: '10px 12px',
                  width: 40,
                  borderBottom: '1px solid var(--probex-border)',
                }}
                aria-label="Live status"
              />
            </tr>
          </thead>
          <tbody>
            {sortedViews.map((view) => (
              <LiveMarketRow
                key={view.id as string}
                view={view}
                onSelect={handleSelectMarket}
              />
            ))}
          </tbody>
        </table>

        {sortedViews.length === 0 && (
          <div
            style={{
              padding: '48px 0',
              textAlign: 'center',
              color: 'var(--probex-text-muted)',
              fontSize: 14,
            }}
            role="status"
          >
            Connecting to live stream…
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Internal stat pill ───────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  live,
  valueColor = 'var(--probex-text-primary)',
}: {
  label: string
  value: string
  live: boolean
  valueColor?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--probex-text-muted)',
        }}
      >
        {label}
        {live && (
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: 'var(--probex-yes)',
              marginLeft: 5,
              verticalAlign: 'middle',
            }}
          />
        )}
      </span>
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: valueColor,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}
