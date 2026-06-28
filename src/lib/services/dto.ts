/**
 * Backend DTOs + normalization adapters — the canonical data contract
 * ───────────────────────────────────────────────────────────────────
 * The frontend domain types (Market, ConsensusState, …) carry historical
 * inconsistencies (aliased volume fields, 0–1 vs 0–100 scores, level-vs-numeric
 * confidence, ISO-vs-epoch dates). Rather than churn the UI, we pin a single
 * NORMALIZED wire contract here and adapt DTO → domain in one place. A live
 * service receives DTOs and calls these adapters; the mock skips them (its data
 * is already in domain shape). UI is untouched.
 *
 * Canonical rules:
 *   • Scores / percentages on the wire are 0–100 ints  (suffix `Pct`)
 *   • Internal probability/score ratios stay 0–1
 *   • Confidence ships BOTH a level and a 0–1 score
 *   • Money fields are explicit USD              (suffix `Usd`)
 *   • Cent prices are explicit                   (suffix `Cents`)
 *   • Entity timestamps are ISO 8601 strings; time-series points use epoch ms
 */

import type {
  Market, AssetClass, BitcoinSegment, MarketStatus, SentimentBias,
} from '@/types/market'
import type {
  ConsensusState, Bias, SignalLevel, ConfidenceLevel, VolatilityLevel, MarketStructure,
} from '@/types/consensus'
import { asMarketId } from '@/types/branded'

// ─── Normalization primitives ──────────────────────────────────────────────────

/** 0–1 ratio → 0–100 percent (wire). */
export const scoreToPct = (score01: number): number => Math.round(score01 * 100)
/** 0–100 percent (wire) → 0–1 ratio (domain). */
export const pctToScore = (pct: number): number => pct / 100

export function confidenceLevelFromScore(score01: number): ConfidenceLevel {
  if (score01 >= 0.66) return 'high'
  if (score01 >= 0.40) return 'medium'
  return 'low'
}
export function confidenceScoreFromLevel(level: ConfidenceLevel): number {
  return level === 'high' ? 0.85 : level === 'medium' ? 0.5 : 0.25
}

export const isoToMs = (iso: string): number => new Date(iso).getTime()
export const msToIso = (ms: number): string => new Date(ms).toISOString()

// ─── Market DTO ────────────────────────────────────────────────────────────────

export interface MarketDTO {
  id:                 string
  assetClass:         AssetClass
  segment:            BitcoinSegment
  title:              string
  description:        string
  probability:        number          // 0–1
  yesPriceCents:      number          // 0–100
  volume24hUsd:       number
  volumeTotalUsd:     number
  liquidityUsd:       number
  openInterestUsd:    number
  status:             MarketStatus
  sentiment:          SentimentBias
  closesAt:           string          // ISO 8601
  createdAt:          string          // ISO 8601
  updatedAt:          string          // ISO 8601
  resolvedAt:         string | null   // ISO 8601 | null
  resolutionCriteria: string
  tags:               string[]
}

export function toMarket(dto: MarketDTO): Market {
  const yesPrice = dto.yesPriceCents
  return {
    id:                 asMarketId(dto.id),
    assetClass:         dto.assetClass,
    segment:            dto.segment,
    title:              dto.title,
    question:           dto.title,            // domain alias
    description:        dto.description,
    probability:        dto.probability,
    yesPrice,
    noPrice:            100 - yesPrice,
    volume:             dto.volume24hUsd,     // domain `volume` aliases 24h
    volume24h:          dto.volume24hUsd,
    volumeTotal:        dto.volumeTotalUsd,
    liquidity:          dto.liquidityUsd,
    openInterest:       dto.openInterestUsd,
    status:             dto.status,
    sentiment:          dto.sentiment,
    resolutionDate:     dto.closesAt,         // domain alias of closesAt
    closesAt:           dto.closesAt,
    resolvedAt:         dto.resolvedAt,
    resolutionCriteria: dto.resolutionCriteria,
    tags:               dto.tags,
    createdAt:          dto.createdAt,
    updatedAt:          dto.updatedAt,
  }
}

// ─── Consensus DTO ───────────────────────────────────────────────────────────────

export interface ConsensusDTO {
  marketId:                     string
  consensusScorePct:            number          // 0–100 (canonical wire scale)
  bias:                         Bias
  institutionalBias:            Bias
  retailBias:                   Bias
  signalStrength:               SignalLevel
  confidenceLevel:              ConfidenceLevel
  confidenceScore:              number          // 0–1
  trendStrengthPct:             number          // 0–100
  volatility:                   VolatilityLevel
  marketStructure:              MarketStructure
  institutionalParticipationPct: number         // 0–100
  consensusVelocity:            number          // -1..1
  updatedAt:                    string          // ISO 8601
}

export function toConsensusState(dto: ConsensusDTO): ConsensusState {
  const instPart = pctToScore(dto.institutionalParticipationPct)
  return {
    marketId:                   asMarketId(dto.marketId),
    score:                      pctToScore(dto.consensusScorePct),
    bias:                       dto.bias,
    institutionalBias:          dto.institutionalBias,
    retailBias:                 dto.retailBias,
    signalStrength:             dto.signalStrength,
    confidence:                 dto.confidenceLevel,
    trendStrength:              pctToScore(dto.trendStrengthPct),
    volatilityRating:           dto.volatility,
    predictionConfidence:       dto.confidenceScore,
    marketStructure:            dto.marketStructure,
    institutionalParticipation: instPart,
    retailParticipation:        1 - instPart,
    consensusVelocity:          dto.consensusVelocity,
    updatedAt:                  dto.updatedAt,
  }
}
