/**
 * Consensus Engine Mock Data
 * ───────────────────────────
 * Deterministic consensus states for all mock markets.
 * The consensus score is the primary data — probability is secondary.
 *
 * Replace: swap the IConsensusService implementation in lib/consensus/index.ts.
 */

import type {
  ConsensusState,
  GlobalConsensusState,
  ConsensusHistoryPoint,
  Bias,
  SignalLevel,
  ConfidenceLevel,
  VolatilityLevel,
  MarketStructure,
} from '@/types/consensus'
import type { MarketId } from '@/types/branded'
import { asMarketId } from '@/types/branded'
import { MOCK_MARKETS } from './markets'

// ─── Factory helper ────────────────────────────────────────────────────────

function consensus(
  marketId: string,
  score: number,
  instBias: Bias,
  retailBias: Bias,
  signal: SignalLevel,
  confidence: ConfidenceLevel,
  trendStrength: number,
  volatility: VolatilityLevel,
  structure: MarketStructure,
  instParticipation = 0.62,
): ConsensusState {
  return {
    marketId:                   asMarketId(marketId),
    score,
    bias:                       instBias,   // primary direction = institutional signal
    institutionalBias:          instBias,
    retailBias,
    signalStrength:             signal,
    confidence,
    trendStrength,
    volatilityRating:           volatility,
    predictionConfidence:       score * 0.95,
    marketStructure:            structure,
    institutionalParticipation: instParticipation,
    retailParticipation:        1 - instParticipation,
    consensusVelocity:          (score - 0.5) * 0.4,
    updatedAt:                  new Date().toISOString(),
  }
}

// ─── Per-market consensus states ──────────────────────────────────────────

export const MOCK_CONSENSUS_MAP: Record<string, ConsensusState> = {
  'btc-150k-dec-2026':      consensus('btc-150k-dec-2026',     0.91, 'bullish', 'bullish',  'strong',   'high',   0.82, 'low',    'trending-up',    0.71),
  'btc-180k-q4-2026':       consensus('btc-180k-q4-2026',      0.68, 'bullish', 'neutral',  'moderate', 'medium', 0.61, 'medium', 'accumulation',   0.65),
  'btc-100k-jun-2026':      consensus('btc-100k-jun-2026',     0.88, 'bullish', 'bullish',  'strong',   'high',   0.79, 'low',    'trending-up',    0.68),
  'btc-120k-ath':           consensus('btc-120k-ath',          0.86, 'bullish', 'bullish',  'strong',   'high',   0.76, 'low',    'breakout',       0.63),
  'btc-200k-2026':          consensus('btc-200k-2026',         0.44, 'neutral', 'bullish',  'weak',     'low',    0.38, 'high',   'ranging',        0.55),
  'btc-vol-80-q3':          consensus('btc-vol-80-q3',         0.52, 'neutral', 'bearish',  'moderate', 'medium', 0.44, 'medium', 'ranging',        0.58),
  'btc-20pct-drawdown':     consensus('btc-20pct-drawdown',    0.61, 'bearish', 'bearish',  'moderate', 'medium', 0.55, 'high',   'distribution',   0.60),
  'btc-vol-index-70':       consensus('btc-vol-index-70',      0.55, 'neutral', 'neutral',  'moderate', 'medium', 0.48, 'medium', 'ranging',        0.52),
  'btc-etf-5b-q2':          consensus('btc-etf-5b-q2',         0.84, 'bullish', 'bullish',  'strong',   'high',   0.77, 'low',    'trending-up',    0.74),
  'ibit-100b-aum':          consensus('ibit-100b-aum',         0.76, 'bullish', 'bullish',  'strong',   'high',   0.69, 'low',    'accumulation',   0.72),
  'btc-etf-positive-10wk':  consensus('btc-etf-positive-10wk', 0.72, 'bullish', 'neutral',  'moderate', 'medium', 0.64, 'low',    'trending-up',    0.67),
  'btc-mvrv-3-5':           consensus('btc-mvrv-3-5',          0.58, 'neutral', 'bullish',  'moderate', 'medium', 0.52, 'medium', 'accumulation',   0.59),
  'btc-exchange-reserve':   consensus('btc-exchange-reserve',  0.79, 'bullish', 'bullish',  'strong',   'high',   0.72, 'low',    'trending-up',    0.66),
  'btc-whale-accumulation': consensus('btc-whale-accumulation',0.82, 'bullish', 'neutral',  'strong',   'high',   0.74, 'low',    'accumulation',   0.78),
  'btc-sopr-above-1':       consensus('btc-sopr-above-1',      0.64, 'bullish', 'neutral',  'moderate', 'medium', 0.58, 'medium', 'ranging',        0.61),
  'btc-hashrate-1zh':       consensus('btc-hashrate-1zh',      0.49, 'neutral', 'neutral',  'weak',     'low',    0.42, 'low',    'ranging',        0.54),
  'btc-difficulty-ath':     consensus('btc-difficulty-ath',    0.83, 'bullish', 'bullish',  'strong',   'high',   0.77, 'low',    'trending-up',    0.65),
  'btc-nodes-20k':          consensus('btc-nodes-20k',         0.51, 'neutral', 'neutral',  'weak',     'medium', 0.44, 'low',    'ranging',        0.50),
  'microstrategy-500k-btc': consensus('microstrategy-500k-btc',0.78, 'bullish', 'bullish',  'strong',   'high',   0.71, 'low',    'accumulation',   0.69),
  'g7-btc-reserve':         consensus('g7-btc-reserve',        0.41, 'neutral', 'bullish',  'weak',     'low',    0.35, 'medium', 'ranging',        0.56),
  'corp-btc-100-companies': consensus('corp-btc-100-companies',0.67, 'bullish', 'bullish',  'moderate', 'medium', 0.60, 'low',    'accumulation',   0.62),
  'btc-inst-score-positive':consensus('btc-inst-score-positive',0.85,'bullish', 'neutral',  'strong',   'high',   0.78, 'low',    'trending-up',    0.76),
  'fed-cut-twice-2026':     consensus('fed-cut-twice-2026',    0.65, 'bullish', 'bullish',  'moderate', 'medium', 0.59, 'medium', 'accumulation',   0.60),
  'btc-gold-ratio-30':      consensus('btc-gold-ratio-30',     0.57, 'bullish', 'neutral',  'moderate', 'medium', 0.51, 'medium', 'ranging',        0.58),
  'btc-sp500-correlation':  consensus('btc-sp500-correlation', 0.46, 'neutral', 'neutral',  'weak',     'low',    0.40, 'medium', 'ranging',        0.52),
  'btc-outperforms-gold-ytd':consensus('btc-outperforms-gold-ytd',0.80,'bullish','bullish', 'strong',   'high',   0.73, 'low',    'trending-up',    0.64),
  'btc-dominance-65':       consensus('btc-dominance-65',      0.74, 'bullish', 'bullish',  'strong',   'high',   0.67, 'low',    'trending-up',    0.66),
  'btc-funding-positive-30d':consensus('btc-funding-positive-30d',0.53,'neutral','neutral', 'moderate', 'medium', 0.47, 'medium', 'ranging',        0.55),
  'btc-oi-cme-20b':         consensus('btc-oi-cme-20b',        0.68, 'bullish', 'bullish',  'moderate', 'medium', 0.61, 'low',    'accumulation',   0.63),
  'btc-spot-vs-deriv':      consensus('btc-spot-vs-deriv',     0.38, 'bearish', 'neutral',  'weak',     'low',    0.32, 'medium', 'distribution',   0.51),
}

// ─── Global consensus state ────────────────────────────────────────────────

export const MOCK_GLOBAL_CONSENSUS: GlobalConsensusState = {
  averageScore:           0.68,
  score:                  0.68,   // alias for averageScore
  strongSignalCount:      18,
  totalMarkets:           MOCK_MARKETS.length,
  institutionalDominance: 'bullish',
  marketRegime:           'trending-up',
  platformConfidence:     'high',
  engineLatencyMs:        42,
  engineUptimePct:        99.42,
  lastProcessedBlock:     58_441_022,
  updatedAt:              new Date().toISOString(),
}

// ─── Consensus history (for spark charts) ────────────────────────────────

export function getMockConsensusHistory(
  marketId: string,
  points = 30,
): ConsensusHistoryPoint[] {
  const base  = MOCK_CONSENSUS_MAP[marketId]?.score ?? 0.65
  const now   = Date.now()
  const idSum = marketId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const biasValues: Bias[] = ['bullish', 'bullish', 'neutral', 'bullish']
  const signalValues: SignalLevel[] = ['strong', 'strong', 'moderate', 'strong']

  return Array.from({ length: points }, (_, i) => {
    const t   = now - (points - i) * 3_600_000  // 1h intervals
    const osc = Math.sin((i + idSum) / 5) * 0.06
    const trend = (i / points) * (base - 0.5) * 0.1
    return {
      timestamp:         t,
      score:             Math.max(0.2, Math.min(0.98, base + osc + trend)),
      institutionalBias: biasValues[i % biasValues.length] as Bias,
      signalStrength:    signalValues[i % signalValues.length] as SignalLevel,
    }
  })
}

// ─── Lookup helpers ────────────────────────────────────────────────────────

export function getConsensusForMarket(marketId: MarketId): ConsensusState | undefined {
  return MOCK_CONSENSUS_MAP[marketId as string]!
}

export function getTopConsensusMarkets(limit = 5): ConsensusState[] {
  return Object.values(MOCK_CONSENSUS_MAP)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
