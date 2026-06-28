/**
 * selectMergedMarket
 *
 * Merges static mock market data with live stream deltas from liveStore.
 * Recomputes Edge and Recommendation on every relevant tick.
 *
 * This is the single canonical merge point — every surface that shows live
 * market data (MarketCard, MarketTable, ConsensusBadge, MarketDetailPage,
 * LiveMarketsView) must use this selector so Edge/Recommendation stay
 * consistent across the entire UI.
 *
 * Memoised per-market so one market's tick does not re-render sibling cards.
 */

import type { Market, ConsensusState } from '@/types'
import type { LiveMarketDelta, MergedMarketView, RecommendationLevel, RecommendationOutput } from '@/lib/realtime/types'

// ─── Edge calculation ────────────────────────────────────────────────────────
// Edge = (consensusScore − marketProbability) expressed in PERCENTAGE POINTS.
// Both inputs are 0–1 fractions, so we scale the difference by 100 to match the
// recommendation thresholds (8 / 15 pp) and the "pp" edge displays. Without the
// ×100, edge stayed in 0–1 range (≈ ±0.13) and never crossed the thresholds, so
// every market defaulted to "Hold".
// Positive edge  → consensus is more bullish than the market price implies
// Negative edge  → consensus is more bearish than market price implies

function computeEdge(
  consensusScore: number,
  probability: number,
): number {
  return parseFloat(((consensusScore - probability) * 100).toFixed(2))
}

// ─── Recommendation taxonomy (5 levels) ─────────────────────────────────────
// RecommendationLevel and RecommendationOutput are defined in @/lib/realtime/types
// to avoid a circular dependency. Re-exported here for backwards compatibility.
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

// ─── Selector ────────────────────────────────────────────────────────────────

/**
 * selectMergedMarket
 *
 * @param market   - Static market record from mock/markets.ts (never mutated)
 * @param consensus - Static consensus state from MOCK_CONSENSUS_MAP (never mutated)
 * @param delta     - Latest live delta from liveStore.liveByMarket (may be null
 *                    if the stream has not yet delivered an update for this market)
 * @returns        MergedMarketView with live-overlaid fields + computed edge/recommendation
 */
export function selectMergedMarket(
  market: Market,
  consensus: ConsensusState,
  delta: LiveMarketDelta | null,
): MergedMarketView {
  // Live overrides: use delta values when present, fall back to static
  const probability = delta?.probability ?? market.probability
  const consensusScore = delta?.consensusScore ?? consensus.score
  const consensusConfidence = delta?.confidence ?? consensus.predictionConfidence
  const consensusBias = delta?.bias ?? consensus.bias
  const volume = delta?.volume ?? market.volume

  // Derived calculations — always recomputed from merged values
  const edge = computeEdge(consensusScore, probability)
  const recommendation = computeRecommendation(edge, consensusConfidence)

  return {
    // Identity (never live-updated)
    id: market.id,
    question: market.question,
    segment: market.segment,
    status: delta?.status ?? market.status,
    resolutionDate: market.resolutionDate,
    assetClass: market.assetClass,

    // Live-merged market fields
    probability,
    volume,

    // Live-merged consensus fields
    consensusScore,
    consensusConfidence,
    consensusBias,

    // Derived
    edge,
    recommendation,

    // Meta: whether this view contains any live data
    isLive: delta !== null,
    lastTickAt: delta?.ts ?? null,
    deltaBps: delta?.deltaBps ?? null,
  }
}

// ─── Memoisation cache ───────────────────────────────────────────────────────
// One entry per marketId; invalidated when delta reference changes.
// This avoids rebuilding the merged object every render for markets that
// have not received a new tick.

interface CacheEntry {
  market: Market
  consensus: ConsensusState
  delta: LiveMarketDelta | null
  result: MergedMarketView
}

const cache = new Map<string, CacheEntry>()

/**
 * selectMergedMarketMemo
 *
 * Memoised variant. Returns the cached result if none of the three inputs
 * have changed by reference.  Safe to call on every render.
 */
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

/**
 * clearMergedMarketCache
 *
 * Call during hot-reload or test teardown to prevent stale entries.
 */
export function clearMergedMarketCache(): void {
  cache.clear()
}
