'use client'

/**
 * MarketsView
 *
 * Subscribes the currently visible market IDs to the stream on mount/filter
 * change, and unsubscribes removed IDs on unmount. This ensures the stream
 * provider only sends ticks for on-screen markets.
 *
 * The actual live data rendering happens per-card/row via useSingleMarketStream
 * inside MarketCard and MarketTableRow — MarketsView itself stays lean.
 *
 */

import { useEffect, useMemo } from 'react'
import { useMarkets, useConsensusMap } from '@/hooks/useServices'
import { useMarketStore } from '@/store'
import { useLiveStore } from '@/store/liveStore'
import { MarketCard } from './MarketCard'
import { MarketTable } from './MarketTable'
import { MarketFilterBar } from './MarketFilterBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { FEATURES } from '@/config/features'
import type { MarketId } from '@/types/branded'

export function MarketsView() {
  const searchQuery   = useMarketStore((s) => s.searchQuery)
  const activeSegment = useMarketStore((s) => s.activeSegment)
  const sortBy        = useMarketStore((s) => s.sortBy)
  const sortDir       = useMarketStore((s) => s.sortDir)
  const viewMode      = useMarketStore((s) => s.viewMode)

  // Data via the service registry (mock mode seeds synchronously via peek*).
  const allMarkets   = useMarkets().data?.data ?? []
  const consensusMap = useConsensusMap().data ?? {}

  // ── Filter + sort markets ─────────────────────────────────────────────────
  const filteredMarkets = useMemo(() => {
    let list = allMarkets

    if (activeSegment) {
      list = list.filter((m) => m.segment === activeSegment)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((m) => m.question.toLowerCase().includes(q))
    }

    list = [...list].sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1
      switch (sortBy) {
        case 'probability':
          return mult * (a.probability - b.probability)
        case 'volume24h':
          return mult * (a.volume - b.volume)
        case 'consensus': {
          const ca = consensusMap[a.id as MarketId]?.score ?? 0
          const cb = consensusMap[b.id as MarketId]?.score ?? 0
          return mult * (ca - cb)
        }
        default:
          return 0
      }
    })

    return list
  }, [allMarkets, consensusMap, activeSegment, searchQuery, sortBy, sortDir])

 // ── Subscribe visible market IDs ─────────────────────────────────
  const liveByMarket = useLiveStore((s) => s.liveByMarket)

  useEffect(() => {
    if (!FEATURES.ENABLE_REALTIME_MARKETS) return

    // No-op: subscription happens inside useSingleMarketStream per card/row.
    // This effect is reserved for future explicit channel management if the
    // stream provider gains a batch-subscribe optimisation path.
    // See: RealtimeProvider → StreamClient.subscribe
  }, [filteredMarkets, liveByMarket])

  const visibleCount = filteredMarkets.length

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        minHeight: '100%',
      }}
    >
      {/* Page landmark for screen readers — markets uses the sticky filter bar
          as its visual header, so the title is visually hidden but present for a11y. */}
      <h1 className="sr-only">Markets</h1>

      {/* Toolbar — sticks to the top of the scroll area (directly beneath the
          fixed top navigation, which lives outside this scroll container). top:0
          keeps search/filters/sort/view controls attached to the header while the
          market list scrolls beneath, with no floating gap. */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backgroundColor: 'var(--probex-bg)',
          paddingBottom: 1,
          borderBottom: '1px solid var(--probex-border)',
        }}
      >
        <MarketFilterBar />
      </div>

      {/* Result count */}
      <div
        style={{
          padding: '10px 24px',
          fontSize: 12,
          color: 'var(--probex-text-muted)',
        }}
      >
        {visibleCount} market{visibleCount !== 1 ? 's' : ''}
        {activeSegment ? ` in ${activeSegment}` : ''}
      </div>

      {/* Content */}
      {filteredMarkets.length === 0 ? (
        <div style={{ padding: '0 24px' }}>
          <EmptyState
            title="No markets found"
            description="Try adjusting your filters or search query."
          />
        </div>
      ) : viewMode === 'table' ? (
        <div style={{ padding: '0 24px 24px' }}>
          <MarketTable
            markets={filteredMarkets}
            consensusMap={consensusMap}
          />
        </div>
      ) : (
        <div
          style={{
            padding: '0 24px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {filteredMarkets.map((market) => {
            const consensus = consensusMap[market.id as MarketId]
            if (!consensus) return null
            return (
              <MarketCard
                key={market.id as string}
                market={market}
                consensus={consensus}
                variant="grid"
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
