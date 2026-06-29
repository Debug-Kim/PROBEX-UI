// Analytics domain types. Each domain has a data type, a time-series point (for
// charts), and a summary (for stat cards); all are Bitcoin- and consensus-aware.

import type { BitcoinSegment } from './market'
import type { Bias, SignalLevel, MarketStructure } from './consensus'

// ─── Timeframe and View ────────────────────────────────────────────────────

export type AnalyticsTimeframe = '1h' | '4h' | '1d' | '1w' | '1m' | '3m' | '1y' | 'ytd' | 'all'

export type AnalyticsViewMode = 'dashboard' | 'deep-dive' | 'comparison' | 'signal-map'

export type AnalyticsMetricId =
  | 'consensus-accuracy'
  | 'signal-strength'
  | 'confidence-trend'
  | 'institutional-flow'
  | 'etf-flows'
  | 'on-chain-activity'
  | 'market-dominance'
  | 'volatility-index'
  | 'btc-price-correlation'
  | 'consensus-vs-probability'

// ─── Base Analytics Point ─────────────────────────────────────────────────

export interface AnalyticsPoint {
  timestamp: number
  value:     number
}

export interface BiAxialPoint extends AnalyticsPoint {
  secondary: number   // second data series on same chart
}

export interface SegmentedPoint extends AnalyticsPoint {
  segment: BitcoinSegment
}

// ─── Consensus Analytics ──────────────────────────────────────────────────

export interface ConsensusAccuracyPoint {
  timestamp:         number
  overallAccuracy:   number   // 0–1: % of consensus-aligned positions that resolved correctly
  instAccuracy:      number   // institutional signal accuracy
  retailAccuracy:    number   // retail signal accuracy
  sampleSize:        number   // number of positions in this window
}

export interface ConsensusStrengthPoint {
  timestamp:      number
  avgScore:       number
  strongCount:    number   // markets with score > 0.75
  weakCount:      number   // markets with score < 0.40
  neutralCount:   number
}

export interface ConsensusAnalyticsSummary {
  period:             string
  avgAccuracy:        number
  peakAccuracy:       number
  totalMarketsScored: number
  strongSignalPct:    number
  instRetailAlignment: number   // 0–1: how often inst/retail agree
  topPerformingSignal: SignalLevel
}

// ─── Signal Analytics ─────────────────────────────────────────────────────

export interface SignalPerformanceRecord {
  signal:           SignalLevel
  accuracy:         number   // 0–1
  avgReturnWhenAligned: number   // USD
  sampleCount:      number
  winRate:          number   // 0–1
}

export interface ConfidenceTrendPoint {
  timestamp:        number
  high:             number   // count of high-confidence readings
  medium:           number
  low:              number
  total:            number
}

// ─── Market Analytics ─────────────────────────────────────────────────────

export interface MarketActivityPoint {
  timestamp:        number
  activeMarkets:    number
  totalVolume:      number   // USD
  resolvedCount:    number
  openedCount:      number
}

export interface SegmentPerformanceRecord {
  segment:          BitcoinSegment
  avgConsensus:     number
  avgAccuracy:      number
  totalVolume:      number
  marketCount:      number
  winRate:          number
}

export interface MarketStructureHistory {
  timestamp:        number
  structure:        MarketStructure
  consensusScore:   number
}

// ─── Portfolio Analytics ──────────────────────────────────────────────────

export interface PortfolioAnalyticsPoint {
  timestamp:        number
  value:            number
  consensusAligned: number   // % of portfolio value in aligned positions
  unrealizedPnl:    number
  winRate:          number
}

export interface PortfolioAnalyticsSummary {
  totalReturn:      number   // USD
  totalReturnPct:   number
  consensusLiftPct: number   // performance premium from consensus alignment
  bestSegment:      BitcoinSegment
  worstSegment:     BitcoinSegment
  sharpeApprox:     number   // simplified Sharpe-like metric
}

// ─── Institutional Flow Analytics ─────────────────────────────────────────

export interface InstitutionalFlowPoint {
  timestamp:         number
  netFlow:           number   // positive = accumulation, negative = distribution
  buyVolume:         number
  sellVolume:        number
  instParticipation: number   // 0–1: share of volume from institutional actors
  bias:              Bias
}

export interface InstitutionalFlowSummary {
  period:            string
  netFlow:           number
  dominantBias:      Bias
  avgParticipation:  number
  streakDays:        number   // days of consistent directional bias
}

// ─── ETF Analytics ────────────────────────────────────────────────────────

export interface ETFFlowPoint {
  timestamp:         number
  netInflow:         number   // USD millions
  ibitFlow:          number   // BlackRock IBIT
  otherFlow:         number   // all other products
  cumulativeAum:     number   // USD billions
}

export interface ETFAnalyticsSummary {
  period:            string
  totalNetInflow:    number
  largestSingleDay:  number
  positiveDaysPct:   number
  currentAum:        number
  abiFlowCorrelation: number   // correlation with BTC price movement
}

// ─── On-Chain Analytics ───────────────────────────────────────────────────

export interface OnChainMetricPoint {
  timestamp:         number
  metric:            OnChainMetricId
  value:             number
  normalized:        number   // 0–1 normalized within historical range
  signal:            'bullish' | 'bearish' | 'neutral'
}

export type OnChainMetricId =
  | 'mvrv'
  | 'sopr'
  | 'exchange-reserve'
  | 'hashrate'
  | 'difficulty'
  | 'whale-accumulation'
  | 'nupl'
  | 'puell-multiple'

export interface OnChainSummary {
  overallSignal:    Bias
  bullishCount:     number
  bearishCount:     number
  neutralCount:     number
  topSignal:        OnChainMetricId
  consensusCorr:    number   // 0–1 correlation with Probex consensus score
}

// ─── Top-level Analytics Dashboard Model ──────────────────────────────────

export interface AnalyticsDashboard {
  asOf:                  string
  consensusSummary:      ConsensusAnalyticsSummary
  institutionalSummary:  InstitutionalFlowSummary
  etfSummary:            ETFAnalyticsSummary
  onChainSummary:        OnChainSummary
  portfolioSummary:      PortfolioAnalyticsSummary
  topSegments:           SegmentPerformanceRecord[]
  signalPerformance:     SignalPerformanceRecord[]
}
