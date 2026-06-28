import type { MarketId } from './branded'

// ─── Consensus signal enums ────────────────────────────────────────────────

export type Bias = 'bullish' | 'bearish' | 'neutral'

export type SignalLevel = 'strong' | 'moderate' | 'weak'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type VolatilityLevel = 'extreme' | 'high' | 'medium' | 'low' | 'very-low'

export type MarketStructure =
  | 'trending-up'
  | 'trending-down'
  | 'ranging'
  | 'accumulation'
  | 'distribution'
  | 'breakout'
  | 'breakdown'

// ─── Per-market consensus state ───────────────────────────────────────────

export interface ConsensusState {
  readonly marketId:          MarketId
  score:                      number            // 0–1, primary consensus metric
  bias:                       Bias              // primary consensus direction (derived from institutionalBias)
  institutionalBias:          Bias
  retailBias:                 Bias
  signalStrength:             SignalLevel
  confidence:                 ConfidenceLevel
  trendStrength:              number            // 0–1
  volatilityRating:           VolatilityLevel
  predictionConfidence:       number            // 0–1
  marketStructure:            MarketStructure
  institutionalParticipation: number            // 0–1, % of volume from institutions
  retailParticipation:        number            // 0–1
  consensusVelocity:          number            // rate of change, -1 to 1
  updatedAt:                  string            // ISO 8601
}

// ─── Global (platform-wide) consensus ─────────────────────────────────────

export interface GlobalConsensusState {
  averageScore:         number
  score:                number   // alias for averageScore — used by components
  strongSignalCount:    number  // markets with strong signals
  totalMarkets:         number
  institutionalDominance: Bias  // overall inst. lean across platform
  marketRegime:         MarketStructure
  platformConfidence:   ConfidenceLevel
  engineLatencyMs:      number
  engineUptimePct:      number
  lastProcessedBlock:   number
  updatedAt:            string
}

// ─── Consensus update (from live subscription) ────────────────────────────

export interface ConsensusUpdate {
  marketId:            MarketId
  score:               number
  institutionalBias:   Bias
  signalStrength:      SignalLevel
  consensusVelocity:   number
  updatedAt:           string
}

// ─── Consensus history point ──────────────────────────────────────────────

export interface ConsensusHistoryPoint {
  timestamp:          number   // Unix ms
  score:              number
  institutionalBias:  Bias
  signalStrength:     SignalLevel
}
