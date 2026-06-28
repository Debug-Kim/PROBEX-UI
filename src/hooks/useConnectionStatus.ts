'use client'

/**
 * useConnectionStatus
 *
 * Returns connection status, latency, and pause controls.
 * Used by ConnectionStatusBadge and LivePauseControl.
 */

import { useLiveStore } from '@/store/liveStore'
import { FEATURES } from '@/config/features'
import type { ConnectionStatus } from '@/lib/realtime/types'

export interface ConnectionStatusView {
  status: ConnectionStatus
  latencyMs: number
  isPaused: boolean
  isEnabled: boolean
  setIsPaused: (v: boolean) => void
}

export function useConnectionStatus(): ConnectionStatusView {
  const status = useLiveStore((s) => s.connectionStatus)
  const latencyMs = useLiveStore((s) => s.latencyMs)
  const isPaused = useLiveStore((s) => s.isPaused)
  const setIsPaused = useLiveStore((s) => s.setIsPaused)

  return {
    status: FEATURES.ENABLE_REALTIME_MARKETS ? status : 'idle',
    latencyMs,
    isPaused,
    isEnabled: FEATURES.ENABLE_REALTIME_MARKETS,
    setIsPaused,
  }
}
