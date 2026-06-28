/**
 * Consensus Module Internal Types
 * ─────────────────────────────────
 * These types are internal to the consensus module.
 * External consumers use the types from src/types/consensus.ts.
 *
 * The consensus module has three layers:
 *
 *   1. Adapters     — translate raw engine output to module types
 *   2. Transformers — enrich/normalize adapter output
 *   3. Scoring      — compute derived scores and classifications
 */

import type { ConsensusState, ConsensusUpdate } from '@/types/consensus'

// ─── Raw engine response (what the API actually returns) ──────────────────
// This type is intentionally separate from ConsensusState.
// The adapter layer transforms RawConsensusResponse → ConsensusState.

export interface RawConsensusResponse {
  market_id:                string
  consensus_score:          number
  institutional_signal:     string  // 'bull' | 'bear' | 'neutral'
  retail_signal:            string
  signal_strength:          string  // 'strong' | 'moderate' | 'weak'
  confidence_rating:        string  // 'high' | 'med' | 'low'
  trend_strength_pct:       number
  volatility_class:         string
  prediction_confidence_pct: number
  market_regime:            string
  inst_participation_pct:   number
  retail_participation_pct: number
  consensus_velocity:       number
  updated_at:               string
}

// ─── Raw batch response ───────────────────────────────────────────────────

export interface RawBatchConsensusResponse {
  markets:    RawConsensusResponse[]
  timestamp:  string
  engine_version: string
}

// ─── Subscription event ───────────────────────────────────────────────────

export interface RawConsensusEvent {
  type:      'consensus_update'
  market_id: string
  data:      Pick<RawConsensusResponse,
    | 'consensus_score'
    | 'institutional_signal'
    | 'signal_strength'
    | 'consensus_velocity'
    | 'updated_at'
  >
}

// ─── Adapter interface ────────────────────────────────────────────────────

export interface IConsensusAdapter {
  /** Transform a single raw response to ConsensusState */
  transform(raw: RawConsensusResponse): ConsensusState
  /** Transform a raw update event to ConsensusUpdate */
  transformUpdate(raw: RawConsensusEvent): ConsensusUpdate
  /** Transform a batch response */
  transformBatch(raw: RawBatchConsensusResponse): ConsensusState[]
}

// ─── Scoring input/output ─────────────────────────────────────────────────

export interface ScoringInput {
  institutionalBias:     number  // -1 to 1
  retailBias:            number  // -1 to 1
  signalStrength:        number  // 0 to 1
  trendStrength:         number  // 0 to 1
  volatility:            number  // 0 to 1
  participation:         number  // 0 to 1
}

export interface CompositeScore {
  score:      number  // 0 to 1 — final consensus score
  confidence: number  // 0 to 1 — confidence in the score
  breakdown:  {
    institutional: number
    retail:        number
    trend:         number
    volatility:    number
  }
}
