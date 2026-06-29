'use client'

// Subscribes a component to live data for the given markets, returning merged
// views (static mock ⊕ live delta + computed edge/recommendation).

import { useMemo } from 'react'
import { useLiveStore } from '@/store/liveStore'
import { MOCK_MARKETS } from '@/mock/markets'
import { MOCK_CONSENSUS_MAP } from '@/mock/consensus'
import { selectMergedMarketMemo } from '@/lib/realtime/selectors'
import { FEATURES } from '@/config/features'
import type { MarketId } from '@/types/branded'
import type { MergedMarketView } from '@/lib/realtime/types'

/** Returns a map of marketId → merged view for the requested markets. */
export function useMarketStream(
  marketIds: MarketId[],
): Map<string, MergedMarketView> {
  const liveByMarket = useLiveStore((s) => s.liveByMarket)

  const merged = useMemo(() => {
    const result = new Map<string, MergedMarketView>()

    for (const id of marketIds) {
      const market = MOCK_MARKETS.find((m) => m.id === id)
      const consensus = MOCK_CONSENSUS_MAP[id]

      if (!market || !consensus) continue

      const delta = FEATURES.ENABLE_REALTIME_MARKETS
        ? liveByMarket[id as string] ?? null
        : null

      result.set(id as string, selectMergedMarketMemo(market, consensus, delta))
    }

    return result
  }, [marketIds, liveByMarket])

  return merged
}

/** Single-market convenience wrapper (MarketCard, MarketDetailPage). */
export function useSingleMarketStream(
  marketId: MarketId,
): MergedMarketView | null {
  const liveByMarket = useLiveStore((s) => s.liveByMarket)

  return useMemo(() => {
    const market = MOCK_MARKETS.find((m) => m.id === marketId)
    const consensus = MOCK_CONSENSUS_MAP[marketId]

    if (!market || !consensus) return null

    const delta = FEATURES.ENABLE_REALTIME_MARKETS
      ? liveByMarket[marketId as string] ?? null
      : null

    return selectMergedMarketMemo(market, consensus, delta)
  }, [marketId, liveByMarket])
}
