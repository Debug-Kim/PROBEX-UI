// Real-time state: connection status, per-market deltas, global consensus delta,
// and a bounded activity ring buffer. Volatile — the tick cache is never persisted
// (only user prefs are). Ticks coalesce on a 100ms flush so a burst yields one
// render pass, not N.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ConnectionStatus,
  LiveMarketDelta,
  GlobalLiveDelta,
  LiveActivityEntry,
  StreamEvent,
} from '@/lib/realtime/types'
import type { MarketId } from '@/types/branded'

const ACTIVITY_BUFFER_SIZE = 50

// ─── State shape ──────────────────────────────────────────────────────────────

interface LivePrefs {
  autoConnect: boolean
  tickerEnabled: boolean
}

interface LiveVolatile {
  connectionStatus: ConnectionStatus
  latencyMs: number
  isPaused: boolean
  liveByMarket: Record<string, LiveMarketDelta>   // keyed by MarketId string
  globalLive: GlobalLiveDelta | null
  liveActivity: LiveActivityEntry[]
  lastSeq: number
}

interface LiveActions {
  // Status
  setConnectionStatus: (status: ConnectionStatus) => void
  setLatencyMs: (ms: number) => void
  setIsPaused: (paused: boolean) => void

  // Prefs
  setAutoConnect: (v: boolean) => void
  setTickerEnabled: (v: boolean) => void

  // Event ingestion (called by RealtimeProvider on each StreamEvent)
  ingestEvent: (event: StreamEvent) => void

  // Getters
  getDelta: (marketId: MarketId) => LiveMarketDelta | null
  reset: () => void
}

type LiveStore = LivePrefs & LiveVolatile & LiveActions

// ─── Pending batch ────────────────────────────────────────────────────────────
// Mutations accumulate here between flush intervals
let pendingDeltas: Record<string, LiveMarketDelta> = {}
let pendingGlobal: GlobalLiveDelta | null = null
let pendingActivity: LiveActivityEntry[] = []
let flushScheduled = false

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLiveStore = create<LiveStore>()(
  persist(
    (set, get) => ({
      // ── Prefs (persisted) ─────────────────────────────────────────────────
      autoConnect: true,
      tickerEnabled: true,

      // ── Volatile (not persisted) ──────────────────────────────────────────
      connectionStatus: 'idle',
      latencyMs: 0,
      isPaused: false,
      liveByMarket: {},
      globalLive: null,
      liveActivity: [],
      lastSeq: 0,

      // ── Status actions ────────────────────────────────────────────────────
      setConnectionStatus: (status) => set({ connectionStatus: status }),
      setLatencyMs: (ms) => set({ latencyMs: ms }),
      setIsPaused: (paused) => set({ isPaused: paused }),

      // ── Pref actions ──────────────────────────────────────────────────────
      setAutoConnect: (v) => set({ autoConnect: v }),
      setTickerEnabled: (v) => set({ tickerEnabled: v }),

      // ── Event ingestion ───────────────────────────────────────────────────
      ingestEvent: (event: StreamEvent) => {
        if (get().isPaused) return

        switch (event.type) {
          case 'snapshot': {
            const next: Record<string, LiveMarketDelta> = {}
            for (const m of event.data.markets) {
              next[m.marketId as string] = {
                marketId: m.marketId,
                probability: m.probability,
                deltaBps: 0,
                consensusScore: m.consensusScore,
                confidence: m.confidence,
                bias: m.bias,
                volume: m.volume,
                status: m.status,
                ts: event.ts,
              }
            }
            pendingGlobal = {
              score: event.data.globalConsensusScore,
              participation: event.data.globalParticipation,
              bullishCount: 0,
              bearishCount: 0,
              ts: event.ts,
            }
            // Flush snapshot immediately (don't batch initial paint)
            set({
              liveByMarket: next,
              globalLive: pendingGlobal,
              lastSeq: event.seq,
            })
            pendingDeltas = {}
            pendingGlobal = null
            flushScheduled = false
            return
          }

          case 'probability_update': {
            if (!event.marketId) return
            const id = event.marketId as string
            const existing =
              pendingDeltas[id] ??
              get().liveByMarket[id] ??
              null
            if (!existing) return
            pendingDeltas[id] = {
              ...existing,
              probability: event.data.probability,
              deltaBps: event.data.deltaBps,
              ts: event.ts,
            }
            break
          }

          case 'consensus_update': {
            if (!event.marketId) return
            const id = event.marketId as string
            const existing =
              pendingDeltas[id] ??
              get().liveByMarket[id] ??
              null
            if (!existing) return
            pendingDeltas[id] = {
              ...existing,
              consensusScore: event.data.score,
              confidence: event.data.confidence,
              bias: event.data.bias,
              ts: event.ts,
            }
            break
          }

          case 'volume_update': {
            if (!event.marketId) return
            const id = event.marketId as string
            const existing =
              pendingDeltas[id] ??
              get().liveByMarket[id] ??
              null
            if (!existing) return
            pendingDeltas[id] = {
              ...existing,
              volume: event.data.volume,
              ts: event.ts,
            }
            break
          }

          case 'market_status_change': {
            if (!event.marketId) return
            const id = event.marketId as string
            const existing =
              pendingDeltas[id] ??
              get().liveByMarket[id] ??
              null
            if (!existing) return
            pendingDeltas[id] = {
              ...existing,
              status: event.data.status,
              ts: event.ts,
            }
            break
          }

          case 'trade':
          case 'activity': {
            const entry: LiveActivityEntry = {
              id: `${event.seq}-${event.ts}`,
              type: event.type === 'trade' ? 'trade' : 'position_open',
              marketId:
                event.marketId ??
                ('' as MarketId),
              summary:
                event.type === 'trade'
                  ? `${event.data.side.toUpperCase()} trade — $${event.data.size}`
                  : (event.data as { summary: string }).summary ?? 'Activity',
              ts: event.ts,
            }
            pendingActivity.push(entry)
            break
          }

          case 'global_consensus_update': {
            pendingGlobal = {
              score: event.data.score,
              participation: event.data.participation,
              bullishCount: event.data.bullishCount,
              bearishCount: event.data.bearishCount,
              ts: event.ts,
            }
            break
          }

          case 'pong': {
            set({ latencyMs: Date.now() - event.data.ts })
            return
          }

          case 'error': {
            // Errors are handled by StreamClient; no store mutation needed
            return
          }
        }

        // Update seq and schedule coalesced flush
        set({ lastSeq: event.seq })
        scheduleFlush(set, get)
      },

      // ── Getters ──────────────────────────────────────────────────────────
      getDelta: (marketId) =>
        get().liveByMarket[marketId as string] ?? null,

      // ── Reset ─────────────────────────────────────────────────────────────
      reset: () =>
        set({
          connectionStatus: 'idle',
          latencyMs: 0,
          isPaused: false,
          liveByMarket: {},
          globalLive: null,
          liveActivity: [],
          lastSeq: 0,
        }),
    }),
    {
      name: 'probex-live-prefs',
      storage: createJSONStorage(() => localStorage),
      // Only persist user prefs — never the volatile tick cache
      partialize: (state) => ({
        autoConnect: state.autoConnect,
        tickerEnabled: state.tickerEnabled,
      }),
    },
  ),
)

// ─── Coalesced flush ──────────────────────────────────────────────────────────

function scheduleFlush(
  set: (partial: Partial<LiveVolatile>) => void,
  get: () => LiveStore,
): void {
  if (flushScheduled) return
  flushScheduled = true

  setTimeout(() => {
    flushScheduled = false

    const updates: Partial<LiveVolatile> = {}

    if (Object.keys(pendingDeltas).length > 0) {
      updates.liveByMarket = {
        ...get().liveByMarket,
        ...pendingDeltas,
      }
      pendingDeltas = {}
    }

    if (pendingGlobal !== null) {
      updates.globalLive = pendingGlobal
      pendingGlobal = null
    }

    if (pendingActivity.length > 0) {
      const current = get().liveActivity
      const combined = [...pendingActivity, ...current].slice(
        0,
        ACTIVITY_BUFFER_SIZE,
      )
      updates.liveActivity = combined
      pendingActivity = []
    }

    if (Object.keys(updates).length > 0) {
      set(updates)
    }
  }, 100)
}
