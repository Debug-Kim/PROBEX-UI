'use client'

/**
 * useGlobalStream
 *
 * Returns the live global consensus snapshot and the bounded live activity
 * buffer. Falls back to static mock values when the feature flag is off.
 */

import { useMemo } from 'react'
import { useLiveStore } from '@/store/liveStore'
import { MOCK_GLOBAL_CONSENSUS } from '@/mock/consensus'
import { FEATURES } from '@/config/features'
import type { GlobalLiveDelta, LiveActivityEntry } from '@/lib/realtime/types'

export interface GlobalStreamView {
  consensusScore: number
  participation: number
  bullishCount: number
  bearishCount: number
  isLive: boolean
  liveActivity: LiveActivityEntry[]
}

export function useGlobalStream(): GlobalStreamView {
  const globalLive = useLiveStore((s) => s.globalLive)
  const liveActivity = useLiveStore((s) => s.liveActivity)

  return useMemo(() => {
    const live: GlobalLiveDelta | null =
      FEATURES.ENABLE_REALTIME_MARKETS ? globalLive : null

    return {
      consensusScore: live?.score ?? MOCK_GLOBAL_CONSENSUS.score,
      participation: live?.participation ?? 0.72,
      bullishCount: live?.bullishCount ?? 18,
      bearishCount: live?.bearishCount ?? 9,
      isLive: live !== null,
      liveActivity: FEATURES.ENABLE_REALTIME_MARKETS ? liveActivity : [],
    }
  }, [globalLive, liveActivity])
}
