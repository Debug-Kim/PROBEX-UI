// Canonical merge point for static market data + live stream deltas. Every
// surface showing live market data uses this so edge/recommendation stay
// consistent. Recomputes edge and recommendation on every relevant tick.

import type { Market, ConsensusState } from '@/types'
import type { LiveMarketDelta, MergedMarketView, RecommendationLevel, RecommendationOutput } from '@/lib/realtime/types'

// Edge = consensusScore − probability, in percentage points. Inputs are 0–1
// fractions; the ×100 is required so edge crosses the 8/15 pp thresholds below
// (without it edge stays ≈ ±0.13 and every market defaults to "Hold").
function computeEdge(
  consensusScore: number,
  probability: number,
): number {
  return parseFloat(((consensusScore - probability) * 100).toFixed(2))
}

// Defined in @/lib/realtime/types to avoid a circular dependency; re-exported here.
export type { RecommendationLevel, RecommendationOutput }

function computeRecommendation(
  edge: number,
  confidence: number,
): RecommendationOutput {
  let level: RecommendationLevel = 'hold'

  if (edge >= 15 && confidence >= 0.7) {
    level = 'strong_buy_yes'
  } else if (edge >= 8 && confidence >= 0.5) {
    level = 'buy_yes'
  } else if (edge <= -15 && confidence >= 0.7) {
    level = 'strong_buy_no'
  } else if (edge <= -8 && confidence >= 0.5) {
    level = 'buy_no'
  }

  const labels: Record<RecommendationLevel, string> = {
    strong_buy_yes: 'Strong Buy YES',
    buy_yes: 'Buy YES',
    hold: 'Hold',
    buy_no: 'Buy NO',
    strong_buy_no: 'Strong Buy NO',
  }

  return { level, label: labels[level], edge, confidence }
}

// `market`/`consensus` are static records (never mutated); `delta` is the latest
// live update, or null before the stream delivers one for this market.
export function selectMergedMarket(
  market: Market,
  consensus: ConsensusState,
  delta: LiveMarketDelta | null,
): MergedMarketView {
  const probability = delta?.probability ?? market.probability
  const consensusScore = delta?.consensusScore ?? consensus.score
  const consensusConfidence = delta?.confidence ?? consensus.predictionConfidence
  const consensusBias = delta?.bias ?? consensus.bias
  const volume = delta?.volume ?? market.volume

  const edge = computeEdge(consensusScore, probability)
  const recommendation = computeRecommendation(edge, consensusConfidence)

  return {
    id: market.id,
    question: market.question,
    segment: market.segment,
    status: delta?.status ?? market.status,
    resolutionDate: market.resolutionDate,
    assetClass: market.assetClass,

    probability,
    volume,

    consensusScore,
    consensusConfidence,
    consensusBias,

    edge,
    recommendation,

    isLive: delta !== null,
    lastTickAt: delta?.ts ?? null,
    deltaBps: delta?.deltaBps ?? null,
  }
}

// One cache entry per marketId, invalidated when any input changes by reference —
// avoids rebuilding the merged view every render for markets without a new tick.
interface CacheEntry {
  market: Market
  consensus: ConsensusState
  delta: LiveMarketDelta | null
  result: MergedMarketView
}

const cache = new Map<string, CacheEntry>()

/** Memoised variant — safe to call on every render. */
export function selectMergedMarketMemo(
  market: Market,
  consensus: ConsensusState,
  delta: LiveMarketDelta | null,
): MergedMarketView {
  const key = market.id as string
  const entry = cache.get(key)

  if (
    entry &&
    entry.market === market &&
    entry.consensus === consensus &&
    entry.delta === delta
  ) {
    return entry.result
  }

  const result = selectMergedMarket(market, consensus, delta)
  cache.set(key, { market, consensus, delta, result })
  return result
}

/** Clear during hot-reload or test teardown to prevent stale entries. */
export function clearMergedMarketCache(): void {
  cache.clear()
}
