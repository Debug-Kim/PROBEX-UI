// Service interface for the QUBO Consensus Engine. Mock vs. live implementation
// is selected by NEXT_PUBLIC_API_MODE. Components consume this via
// src/hooks/useConsensus.ts, never the implementations directly.

import type { MarketId } from '@/types/branded'
import type {
  ConsensusState,
  ConsensusUpdate,
  GlobalConsensusState,
} from '@/types/consensus'

export type Unsubscribe = () => void

/** Contract both mock and live implementations satisfy. */
export interface IConsensusService {
  getMarketConsensus(marketId: MarketId): Promise<ConsensusState>

  /** Batched fetch — one request instead of N getMarketConsensus calls. */
  batchGetConsensus(marketIds: MarketId[]): Promise<Map<MarketId, ConsensusState>>

  getGlobalConsensus(): Promise<GlobalConsensusState>

  /** Subscribe to live updates; call the returned unsubscribe on unmount. */
  subscribeToConsensus(
    marketId: MarketId,
    callback: (update: ConsensusUpdate) => void,
  ): Unsubscribe
}

export type { RawConsensusResponse, IConsensusAdapter } from './types'
