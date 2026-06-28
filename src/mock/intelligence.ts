/**
 * Prediction Intelligence Mock Layer
 * ──────────────────────────────────
 * Derives narrative + explainability intelligence from the existing consensus
 * dataset (mock/consensus.ts). This is the only *new* mock data introduced for
 * the Consensus Engine flagship — everything else reuses existing generators.
 *
 * Deterministic: same market → same output every render.
 */

import type { ConsensusState, Bias, MarketStructure } from '@/types/consensus'
import type { Market } from '@/types/market'
import type { RecommendationOutput } from '@/lib/realtime/types'
import { getMockConsensusHistory } from '@/mock/consensus'

// ─── Intelligence summary (narrative) ───────────────────────────────────────

export interface IntelligenceSummary {
  headline:   string
  narrative:  string
  verdict:    string                 // short directional verdict
  conviction: 'High' | 'Moderate' | 'Low'
  direction:  Bias
}

const BIAS_WORD: Record<Bias, string> = { bullish: 'bullish', bearish: 'bearish', neutral: 'neutral' }

export function getIntelligenceSummary(
  market:    Market,
  consensus: ConsensusState,
  rec:       RecommendationOutput,
): IntelligenceSummary {
  const pct       = Math.round(consensus.score * 100)
  const instPct   = Math.round(consensus.institutionalParticipation * 100)
  const aligned   = consensus.institutionalBias === consensus.retailBias
  const direction = consensus.bias
  const conviction: IntelligenceSummary['conviction'] =
    consensus.signalStrength === 'strong' && consensus.confidence === 'high' ? 'High'
    : consensus.signalStrength === 'weak' || consensus.confidence === 'low' ? 'Low'
    : 'Moderate'

  const alignmentClause = aligned
    ? `Institutional and retail flows agree (${BIAS_WORD[direction]}), reinforcing the signal`
    : `Institutional positioning (${BIAS_WORD[consensus.institutionalBias]}) diverges from retail (${BIAS_WORD[consensus.retailBias]}), a contrarian setup`

  const headline =
    `${conviction === 'High' ? 'High-conviction' : conviction === 'Low' ? 'Low-conviction' : 'Moderate'} ${BIAS_WORD[direction]} consensus`

  const narrative =
    `The QUBO engine reads a ${pct}% consensus score on “${market.title}”, driven by ${BIAS_WORD[consensus.institutionalBias]} ` +
    `institutional positioning that represents ${instPct}% of traded volume. ${alignmentClause}. ` +
    `Signal strength is ${consensus.signalStrength} with ${consensus.confidence} confidence, and the regime reads ` +
    `${formatStructure(consensus.marketStructure)}. The trading layer's formal recommendation is ${rec.label}.`

  const verdict =
    conviction === 'High'
      ? `Strong ${BIAS_WORD[direction]} conviction — signals are aligned and confident.`
      : conviction === 'Low'
        ? `Weak signal — treat with caution and wait for confirmation.`
        : `Moderate ${BIAS_WORD[direction]} lean — watch for confirmation from flows.`

  return { headline, narrative, verdict, conviction, direction }
}

// ─── Explainability drivers ─────────────────────────────────────────────────

export interface ExplainDriver {
  label:     string
  weight:    number               // normalized 0–1 contribution to the score
  direction: Bias
  detail:    string
}

const STRUCTURE_DIRECTION: Record<MarketStructure, Bias> = {
  'trending-up':   'bullish',
  'breakout':      'bullish',
  'accumulation':  'bullish',
  'ranging':       'neutral',
  'distribution':  'bearish',
  'trending-down': 'bearish',
  'breakdown':     'bearish',
}

export function getExplainabilityDrivers(consensus: ConsensusState): ExplainDriver[] {
  const signalWeight = consensus.signalStrength === 'strong' ? 0.9 : consensus.signalStrength === 'moderate' ? 0.6 : 0.3
  const velocityDir: Bias = consensus.consensusVelocity > 0.02 ? 'bullish' : consensus.consensusVelocity < -0.02 ? 'bearish' : 'neutral'
  const volWeight = consensus.volatilityRating === 'extreme' ? 0.85 : consensus.volatilityRating === 'high' ? 0.65 : consensus.volatilityRating === 'medium' ? 0.45 : 0.25

  const raw: ExplainDriver[] = [
    { label: 'Institutional positioning', weight: consensus.institutionalParticipation,        direction: consensus.institutionalBias, detail: `${Math.round(consensus.institutionalParticipation * 100)}% of volume · ${consensus.institutionalBias}` },
    { label: 'Signal strength',           weight: signalWeight,                                 direction: consensus.bias,              detail: `${consensus.signalStrength} signal · ${consensus.confidence} confidence` },
    { label: 'Trend momentum',            weight: consensus.trendStrength,                      direction: velocityDir,                 detail: `${Math.round(consensus.trendStrength * 100)}% trend strength` },
    { label: 'Retail sentiment',          weight: consensus.retailParticipation,                direction: consensus.retailBias,        detail: `${Math.round(consensus.retailParticipation * 100)}% of volume · ${consensus.retailBias}` },
    { label: 'Market structure',          weight: 0.55,                                         direction: STRUCTURE_DIRECTION[consensus.marketStructure] ?? 'neutral', detail: formatStructure(consensus.marketStructure) },
    { label: 'Volatility regime',         weight: volWeight,                                    direction: 'neutral',                   detail: `${consensus.volatilityRating} volatility` },
  ]

  const total = raw.reduce((s, d) => s + d.weight, 0) || 1
  return raw
    .map((d) => ({ ...d, weight: d.weight / total }))
    .sort((a, b) => b.weight - a.weight)
}

// ─── Confidence evolution ───────────────────────────────────────────────────

export interface ConfidencePoint {
  timestamp:  number
  confidence: number   // %
  lower:      number   // band floor %
  upper:      number   // band ceiling %
}

export function getConfidenceEvolution(marketId: string, base: number, points = 30): ConfidencePoint[] {
  const now    = Date.now()
  const seed   = marketId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + 4242
  const center = base * 100

  return Array.from({ length: points }, (_, i) => {
    const osc   = Math.sin((i + seed) / 4) * 6
    const drift = (i / points) * 8
    const conf  = Math.max(20, Math.min(98, center - 10 + drift + osc))
    const band  = 6 + ((seed + i) % 5)
    return {
      timestamp:  now - (points - i) * 3_600_000,
      confidence: Math.round(conf),
      lower:      Math.round(Math.max(0, conf - band)),
      upper:      Math.round(Math.min(100, conf + band)),
    }
  })
}

// ─── Historical snapshots ───────────────────────────────────────────────────

export interface ConsensusSnapshot {
  id:        string
  label:     string
  timestamp: number
  score:     number   // %
  bias:      Bias
  signal:    string
  delta:     number   // pp change vs previous snapshot
}

export function getHistoricalSnapshots(marketId: string): ConsensusSnapshot[] {
  const hist = getMockConsensusHistory(marketId, 30)
  const picks = [29, 24, 18, 12, 6, 0]
    .filter((idx) => idx < hist.length)
    .map((idx) => ({ idx, point: hist[idx]! }))

  return picks.map(({ idx, point }, i) => {
    const prev  = picks[i + 1]?.point
    const score = Math.round(point.score * 100)
    const delta = prev ? score - Math.round(prev.score * 100) : 0
    const hoursAgo = hist.length - 1 - idx
    return {
      id:        `snap-${idx}`,
      label:     hoursAgo === 0 ? 'Now' : `${hoursAgo}h ago`,
      timestamp: point.timestamp,
      score,
      bias:      point.institutionalBias,
      signal:    point.signalStrength,
      delta,
    }
  })
}

// ─── Shared helper ──────────────────────────────────────────────────────────

export function formatStructure(s: MarketStructure): string {
  const map: Record<MarketStructure, string> = {
    'trending-up':   'an uptrend',
    'trending-down': 'a downtrend',
    'ranging':       'a ranging market',
    'accumulation':  'accumulation',
    'distribution':  'distribution',
    'breakout':      'a breakout',
    'breakdown':     'a breakdown',
  }
  return map[s] ?? s
}
