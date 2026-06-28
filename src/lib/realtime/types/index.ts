/**
 * src/lib/realtime/types/index.ts
 *
 * Complete realtime type definitions for.
 * Discriminated union over StreamEvent.type — no `any`.
 * Branded MarketId is preserved across the wire boundary via as*() factories.
 */

import type { MarketId } from '@/types/branded'
import type { MarketStatus } from '@/types/market'

// ─── Connection ───────────────────────────────────────────────────────────────

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'closed'
  | 'error'

// ─── Channel descriptors (client → server) ────────────────────────────────────

export type StreamChannel =
  | { kind: 'market'; marketId: MarketId }
  | { kind: 'global' }
  | { kind: 'activity' }

// ─── Wire envelope ────────────────────────────────────────────────────────────

export interface StreamEnvelope<T extends string, D> {
  type: T
  seq: number     // monotonic; gap triggers resync
  ts: number      // epoch ms
  marketId?: MarketId
  data: D
}

// ─── Server → client event data payloads ─────────────────────────────────────

export interface SnapshotData {
  markets: Array<{
    marketId: MarketId
    probability: number
    consensusScore: number
    confidence: number
    bias: 'bullish' | 'bearish' | 'neutral'
    volume: number
    status: MarketStatus
  }>
  globalConsensusScore: number
  globalParticipation: number
}

export interface ProbabilityUpdateData {
  probability: number
  deltaBps: number        // basis points change since last tick
}

export interface ConsensusUpdateData {
  score: number
  confidence: number
  bias: 'bullish' | 'bearish' | 'neutral'
}

export interface VolumeUpdateData {
  volume: number
  delta: number
}

export interface TradeData {
  side: 'yes' | 'no'
  size: number
  price: number
  ts: number
}

export interface ActivityData {
  id: string
  type: 'trade' | 'position_open' | 'position_close' | 'market_created'
  marketId: MarketId
  summary: string
  ts: number
}

export interface MarketStatusChangeData {
  status: MarketStatus
}

export interface GlobalConsensusUpdateData {
  score: number
  participation: number
  bullishCount: number
  bearishCount: number
}

export interface PongData {
  ts: number
}

export interface ErrorData {
  code: string
  message: string
  retryable: boolean
}

// ─── Discriminated union ──────────────────────────────────────────────────────

export type StreamEvent =
  | StreamEnvelope<'snapshot', SnapshotData>
  | StreamEnvelope<'probability_update', ProbabilityUpdateData>
  | StreamEnvelope<'consensus_update', ConsensusUpdateData>
  | StreamEnvelope<'volume_update', VolumeUpdateData>
  | StreamEnvelope<'trade', TradeData>
  | StreamEnvelope<'activity', ActivityData>
  | StreamEnvelope<'market_status_change', MarketStatusChangeData>
  | StreamEnvelope<'global_consensus_update', GlobalConsensusUpdateData>
  | StreamEnvelope<'pong', PongData>
  | StreamEnvelope<'error', ErrorData>

export type StreamEventType = StreamEvent['type']

// ─── Live delta (what liveStore holds per market) ─────────────────────────────

export interface LiveMarketDelta {
  marketId: MarketId
  probability: number
  deltaBps: number
  consensusScore: number
  confidence: number
  bias: 'bullish' | 'bearish' | 'neutral'
  volume: number
  status: MarketStatus
  ts: number              // timestamp of the last tick
}

// ─── Global live state ────────────────────────────────────────────────────────

export interface GlobalLiveDelta {
  score: number
  participation: number
  bullishCount: number
  bearishCount: number
  ts: number
}

// ─── Live activity buffer entry ───────────────────────────────────────────────

export interface LiveActivityEntry {
  id: string
  type: 'trade' | 'position_open' | 'position_close' | 'market_created'
  marketId: MarketId
  summary: string
  ts: number
}

// ─── Merged view (selector output) ───────────────────────────────────────────


// ─── Recommendation types (defined here to avoid circular with selectors) ────────

export type RecommendationLevel =
  | 'strong_buy_yes'
  | 'buy_yes'
  | 'hold'
  | 'buy_no'
  | 'strong_buy_no'

export interface RecommendationOutput {
  level: RecommendationLevel
  label: string
  edge: number
  confidence: number
}

// ─── Merged view (selector output) ───────────────────────────────────────────

export interface MergedMarketView {
  // Identity
  id: MarketId
  question: string
  segment: string
  status: MarketStatus
  resolutionDate: string
  assetClass: string

  // Merged market fields
  probability: number
  volume: number

  // Merged consensus fields
  consensusScore: number
  consensusConfidence: number
  consensusBias: 'bullish' | 'bearish' | 'neutral'

  // Derived
  edge: number
  recommendation: RecommendationOutput

  // Meta
  isLive: boolean
  lastTickAt: number | null
  deltaBps: number | null
}

// ─── Service interface (swap mock → real in one factory) ──────────────────────

export interface IMarketStreamService {
  /** Begin emitting events; calls handler for each StreamEvent */
  connect(handler: (event: StreamEvent) => void): void
  /** Subscribe to specific channels */
  subscribe(channels: StreamChannel[]): void
  /** Unsubscribe from channels */
  unsubscribe(channels: StreamChannel[]): void
  /** Request a full snapshot resync from lastSeq */
  resync(lastSeq: number): void
  /** Cleanly disconnect */
  disconnect(): void
}
