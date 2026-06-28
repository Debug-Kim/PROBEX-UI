/**
 * Consensus Module
 * ─────────────────
 * The Consensus Engine is Probex's primary product differentiator.
 * This module provides the service interface and type architecture
 * for integrating with the proprietary QUBO Consensus Engine.
 *
 * Architecture:
 *
 *   IConsensusService (interface)
 *         │
 * ├─── MockConsensusService (–3, API_MODE=mock)
 * └─── LiveConsensusService (+, API_MODE=live)
 *
 * The active implementation is selected via environment variable:
 *   NEXT_PUBLIC_API_MODE=mock  → MockConsensusService
 *   NEXT_PUBLIC_API_MODE=live  → LiveConsensusService
 *
 * Components always import from src/hooks/useConsensus.ts —
 * never import service implementations directly.
 */

import type { MarketId } from '@/types/branded'
import type {
  ConsensusState,
  ConsensusUpdate,
  GlobalConsensusState,
} from '@/types/consensus'

// ─── Service interface ────────────────────────────────────────────────────

/** Unsubscribe function returned by subscription methods. */
export type Unsubscribe = () => void

/**
 * IConsensusService
 * ─────────────────
 * Contract that both mock and live implementations must satisfy.
 * The backend team implements LiveConsensusService to this interface.
 * No component rewrites required when switching from mock to live.
 */
export interface IConsensusService {
  /**
   * Fetch current consensus state for a single market.
   */
  getMarketConsensus(marketId: MarketId): Promise<ConsensusState>

  /**
   * Fetch consensus state for multiple markets in one request.
   * More efficient than multiple getMarketConsensus calls.
   */
  batchGetConsensus(marketIds: MarketId[]): Promise<Map<MarketId, ConsensusState>>

  /**
   * Fetch platform-wide global consensus overview.
   */
  getGlobalConsensus(): Promise<GlobalConsensusState>

  /**
   * Subscribe to real-time consensus updates for a market.
   * Returns an unsubscribe function — call it on component unmount.
   *
   * @example
   *   const unsub = consensusService.subscribeToConsensus(marketId, (update) => {
   *     setScore(update.score)
   *   })
   *   return () => unsub()
   */
  subscribeToConsensus(
    marketId: MarketId,
    callback: (update: ConsensusUpdate) => void,
  ): Unsubscribe
}

// ─── Internal module exports ───────────────────────────────────────────────

export type { RawConsensusResponse, IConsensusAdapter } from './types'
