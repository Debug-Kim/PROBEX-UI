'use client'

/**
 * useMarketStream
 *
 * Subscribe a component to live data for one or more marketIds.
 * Returns the merged view (static mock ⊕ live delta + computed edge/recommendation)
 * for the first marketId, or the full delta map for multi-market components.
 *
 * Subscription is registered on mount, released on unmount — preventing
 * off-screen markets from consuming stream bandwidth.
 */

import { useMemo } from 'react'
import { useLiveStore } from '@/store/liveStore'
import { MOCK_MARKETS } from '@/mock/markets'
import { MOCK_CONSENSUS_MAP } from '@/mock/consensus'
import { selectMergedMarketMemo } from '@/lib/realtime/selectors'
import { FEATURES } from '@/config/features'
import type { MarketId } from '@/types/branded'
import type { MergedMarketView } from '@/lib/realtime/types'

/**
 * useMarketStream(marketIds)
 *
 * @param marketIds - Array of MarketId strings to subscribe to
 * @returns         Map of marketId → MergedMarketView
 */
export function useMarketStream(
  marketIds: MarketId[],
): Map<string, MergedMarketView> {
  const liveByMarket = useLiveStore((s) => s.liveByMarket)

  // Build merged views for all requested markets
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

/**
 * useSingleMarketStream(marketId)
 *
 * Convenience wrapper for single-market components (MarketCard, MarketDetailPage).
 * Returns MergedMarketView | null.
 */
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
