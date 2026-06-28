/**
 * Analytics Mock Data
 * ────────────────────
 * Deterministic time-series data for all analytics domains.
 * Same seed → same values every render.
 *
 * Domains covered:
 *   1. Consensus accuracy + strength + confidence
 *   2. Signal performance by type
 *   3. Institutional flow (accumulation/distribution)
 *   4. ETF inflows (modelled on 2026 data trends)
 *   5. On-chain signals (MVRV, SOPR, exchange reserves, hashrate)
 *   6. Market activity (active markets, volume, resolutions)
 *   7. Segment performance
 *   8. BTC macro context (DXY correlation, rate sensitivity)
 *
 * replace with IAnalyticsService backed by indexer + consensus engine API.
 */

import type {
  ConsensusAccuracyPoint,
  ConsensusStrengthPoint,
  ConfidenceTrendPoint,
  InstitutionalFlowPoint,
  ETFFlowPoint,
  OnChainMetricPoint,
  MarketActivityPoint,
  SegmentPerformanceRecord,
  SignalPerformanceRecord,
  ConsensusAnalyticsSummary,
  InstitutionalFlowSummary,
  ETFAnalyticsSummary,
  OnChainSummary,
  AnalyticsDashboard,
  PortfolioAnalyticsSummary,
} from '@/types/analytics'
import type { BitcoinSegment }  from '@/types/market'
import type { Bias }            from '@/types/consensus'

// ─── Seeded deterministic RNG ──────────────────────────────────────────────

const DAY_MS  = 86_400_000
const NOW     = Date.now()
const START   = new Date('2026-01-15T00:00:00Z').getTime()
const DAYS    = Math.ceil((NOW - START) / DAY_MS)

function rand(seed: number, i: number): number {
  const x = Math.sin(seed * 9301 + i * 49297 + 233) * 14159
  return Math.abs(x - Math.floor(x))
}

function smoothRandWalk(
  seed:     number,
  n:        number,
  start:    number,
  target:   number,
  noise:    number,
  clamp:    [number, number] = [0, 1],
): number[] {
  const out: number[] = []
  let v = start
  for (let i = 0; i < n; i++) {
    const drift = (target - v) * 0.06
    v = Math.max(clamp[0], Math.min(clamp[1], v + drift + (rand(seed, i) - 0.5) * noise))
    out.push(Math.round(v * 1000) / 1000)
  }
  return out
}

// ─── 1. Consensus Accuracy History ────────────────────────────────────────

export function getConsensusAccuracyHistory(): ConsensusAccuracyPoint[] {
  const overall  = smoothRandWalk(101, DAYS, 0.55, 0.76, 0.04, [0.3, 0.99])
  const inst     = smoothRandWalk(202, DAYS, 0.60, 0.82, 0.035, [0.35, 0.99])
  const retail   = smoothRandWalk(303, DAYS, 0.45, 0.67, 0.05,  [0.2, 0.99])

  return overall.map((v, i) => ({
    timestamp:       START + i * DAY_MS,
    overallAccuracy: v,
    instAccuracy:    inst[i] ?? v,
    retailAccuracy:  retail[i] ?? v,
    sampleSize:      Math.round(15 + rand(404, i) * 20),
  }))
}

// ─── 2. Consensus Strength History ────────────────────────────────────────

export function getConsensusStrengthHistory(): ConsensusStrengthPoint[] {
  const scores  = smoothRandWalk(501, DAYS, 0.60, 0.72, 0.03, [0.40, 0.98])
  const total   = 30  // fixed market count

  return scores.map((v, i) => {
    const strong  = Math.round(total * v * 0.65)
    const weak    = Math.round(total * (1 - v) * 0.5)
    return {
      timestamp:    START + i * DAY_MS,
      avgScore:     v,
      strongCount:  strong,
      weakCount:    weak,
      neutralCount: total - strong - weak,
    }
  })
}

// ─── 3. Confidence Trend History ──────────────────────────────────────────

export function getConfidenceTrendHistory(): ConfidenceTrendPoint[] {
  const highPct  = smoothRandWalk(601, DAYS, 0.30, 0.45, 0.04, [0.15, 0.70])
  const total    = 30

  return highPct.map((h, i) => {
    const highN   = Math.round(total * h)
    const lowN    = Math.round(total * (1 - h) * 0.35)
    return {
      timestamp: START + i * DAY_MS,
      high:      highN,
      medium:    total - highN - lowN,
      low:       lowN,
      total,
    }
  })
}

// ─── 4. Institutional Flow History ────────────────────────────────────────

export function getInstitutionalFlowHistory(): InstitutionalFlowPoint[] {
  const netFlows = smoothRandWalk(701, DAYS, 100_000, 450_000, 80_000, [-300_000, 1_200_000])
  const biases: Bias[] = ['bullish', 'bullish', 'bullish', 'neutral', 'bullish']

  return netFlows.map((flow, i) => {
    const buyVol  = flow > 0 ? flow : flow * 0.3
    const sellVol = flow > 0 ? flow * 0.25 : Math.abs(flow)
    return {
      timestamp:         START + i * DAY_MS,
      netFlow:           Math.round(flow),
      buyVolume:         Math.round(Math.abs(buyVol)),
      sellVolume:        Math.round(Math.abs(sellVol)),
      instParticipation: 0.55 + rand(702, i) * 0.20,
      bias:              biases[i % biases.length] as Bias,
    }
  })
}

// ─── 5. ETF Flow History ──────────────────────────────────────────────────

/** Models 2026 Bitcoin ETF inflow trends — strong Q1/Q2 pace */
export function getETFFlowHistory(): ETFFlowPoint[] {
  const netFlows = smoothRandWalk(801, DAYS, 80, 120, 40, [-200, 600])   // USD millions/day
  let cumulativeAum = 72_000  // starting AUM in USD millions

  return netFlows.map((flow, i) => {
    cumulativeAum = Math.max(60_000, cumulativeAum + flow * 0.85)
    const ibitShare = 0.42 + rand(802, i) * 0.08
    return {
      timestamp:      START + i * DAY_MS,
      netInflow:      Math.round(flow),
      ibitFlow:       Math.round(flow * ibitShare),
      otherFlow:      Math.round(flow * (1 - ibitShare)),
      cumulativeAum:  Math.round(cumulativeAum),
    }
  })
}

// ─── 6. On-Chain Signal History ────────────────────────────────────────────

type OnChainSignal = 'bullish' | 'bearish' | 'neutral'

export function getOnChainHistory(metricId: string): OnChainMetricPoint[] {
  const seedMap: Record<string, [number, number, number, [number, number]]> = {
    'mvrv':               [901,  1.8, 2.8,  [0.8, 5.0]],
    'sopr':               [902,  0.98, 1.06, [0.9, 1.3]],
    'exchange-reserve':   [903,  2.4, 2.1,   [1.8, 3.0]],
    'hashrate':           [904,  580, 720,   [400, 900]],
    'difficulty':         [905,  88, 105,    [70,  130]],
    'whale-accumulation': [906,  0.4, 0.7,   [0,   1.0]],
    'nupl':               [907,  0.45, 0.62, [0,   0.95]],
    'puell-multiple':     [908,  0.8, 1.4,   [0.3, 3.5]],
  }

  const params = seedMap[metricId] ?? seedMap['mvrv']!
  const [seed, start, target, clamp] = params
  const values = smoothRandWalk(seed, DAYS, start, target, (clamp[1] - clamp[0]) * 0.03, clamp as [number, number])
  const range  = clamp[1] - clamp[0]

  return values.map((v, i) => {
    const normalized = (v - clamp[0]) / range
    const signal: OnChainSignal =
      normalized > 0.65 ? 'bullish' : normalized < 0.35 ? 'bearish' : 'neutral'
    return {
      timestamp:   START + i * DAY_MS,
      metric:      metricId as import('@/types/analytics').OnChainMetricId,
      value:       Math.round(v * 100) / 100,
      normalized:  Math.round(normalized * 1000) / 1000,
      signal,
    }
  })
}

// ─── 7. Market Activity History ────────────────────────────────────────────

export function getMarketActivityHistory(): MarketActivityPoint[] {
  return Array.from({ length: DAYS }, (_, i) => ({
    timestamp:     START + i * DAY_MS,
    activeMarkets: Math.round(25 + rand(1001, i) * 8),
    totalVolume:   Math.round((800_000 + rand(1002, i) * 600_000)),
    resolvedCount: Math.floor(rand(1003, i) * 2.5),
    openedCount:   Math.floor(rand(1004, i) * 3),
  }))
}

// ─── 8. Segment Performance Records ───────────────────────────────────────

const SEGMENTS: BitcoinSegment[] = [
  'price-targets', 'etf-flows', 'on-chain-metrics', 'institutional-activity',
  'market-structure', 'volatility', 'network-health', 'macro-signals',
]

export const SEGMENT_ANALYTICS: SegmentPerformanceRecord[] = SEGMENTS.map((seg, i) => ({
  segment:      seg,
  avgConsensus: 0.55 + rand(2001, i) * 0.30,
  avgAccuracy:  0.52 + rand(2002, i) * 0.28,
  totalVolume:  Math.round(500_000 + rand(2003, i) * 2_000_000),
  marketCount:  Math.round(2 + rand(2004, i) * 5),
  winRate:      0.48 + rand(2005, i) * 0.26,
}))

// ─── 9. Signal Performance Records ────────────────────────────────────────

export const SIGNAL_PERFORMANCE: SignalPerformanceRecord[] = [
  { signal: 'strong',   accuracy: 0.78, avgReturnWhenAligned: 42.50, sampleCount: 89,  winRate: 0.76 },
  { signal: 'moderate', accuracy: 0.64, avgReturnWhenAligned: 18.20, sampleCount: 134, winRate: 0.63 },
  { signal: 'weak',     accuracy: 0.51, avgReturnWhenAligned:  5.80, sampleCount: 72,  winRate: 0.52 },
]

// ─── 10. Summary Objects ──────────────────────────────────────────────────

export const CONSENSUS_ANALYTICS_SUMMARY: ConsensusAnalyticsSummary = {
  period:               'Jan 15 – present 2026',
  avgAccuracy:          0.71,
  peakAccuracy:         0.88,
  totalMarketsScored:   DAYS * 30,
  strongSignalPct:      0.44,
  instRetailAlignment:  0.62,
  topPerformingSignal:  'strong',
}

export const INSTITUTIONAL_FLOW_SUMMARY: InstitutionalFlowSummary = {
  period:           '2026 YTD',
  netFlow:          4_820_000,
  dominantBias:     'bullish',
  avgParticipation: 0.66,
  streakDays:       18,
}

export const ETF_ANALYTICS_SUMMARY: ETFAnalyticsSummary = {
  period:              '2026 YTD',
  totalNetInflow:      4_218,         // USD millions
  largestSingleDay:    487,           // USD millions
  positiveDaysPct:     0.72,
  currentAum:          94_200,        // USD millions
  abiFlowCorrelation:  0.68,
}

export const ON_CHAIN_SUMMARY: OnChainSummary = {
  overallSignal:   'bullish',
  bullishCount:    5,
  bearishCount:    1,
  neutralCount:    2,
  topSignal:       'whale-accumulation',
  consensusCorr:   0.74,
}

export const PORTFOLIO_ANALYTICS_SUMMARY: PortfolioAnalyticsSummary = {
  totalReturn:      1_842.30,
  totalReturnPct:   0.184,
  consensusLiftPct: 0.062,   // 6.2% performance premium vs non-aligned positions
  bestSegment:      'price-targets',
  worstSegment:     'macro-signals',
  sharpeApprox:     1.38,
}

// ─── Full Analytics Dashboard Snapshot ────────────────────────────────────

export const ANALYTICS_DASHBOARD: AnalyticsDashboard = {
  asOf:                  new Date().toISOString(),
  consensusSummary:      CONSENSUS_ANALYTICS_SUMMARY,
  institutionalSummary:  INSTITUTIONAL_FLOW_SUMMARY,
  etfSummary:            ETF_ANALYTICS_SUMMARY,
  onChainSummary:        ON_CHAIN_SUMMARY,
  portfolioSummary:      PORTFOLIO_ANALYTICS_SUMMARY,
  topSegments:           SEGMENT_ANALYTICS.slice(0, 3),
  signalPerformance:     SIGNAL_PERFORMANCE,
}
