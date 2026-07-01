// Backend DTOs + normalization adapters — the canonical wire contract. Domain
// types carry historical inconsistencies, so we pin one normalized shape here and
// adapt DTO → domain in a single place. Live services receive DTOs and call these
// adapters; the mock skips them (already in domain shape).
//
// Wire conventions:
//   • Scores / percentages are 0–100 ints (suffix `Pct`); internal ratios stay 0–1
//   • Confidence ships BOTH a level and a 0–1 score
//   • Money is explicit USD (`Usd`); cent prices are explicit (`Cents`)
//   • Entity timestamps are ISO 8601 strings; time-series points use epoch ms

import type {
  Market, AssetClass, BitcoinSegment, MarketStatus, SentimentBias,
} from '@/types/market'
import type {
  ConsensusState, Bias, SignalLevel, ConfidenceLevel, VolatilityLevel, MarketStructure,
} from '@/types/consensus'
import { asMarketId } from '@/types/branded'
import type {
  EngineHealthDTO, HealthComponentDTO, RuntimeComponentsDTO,
  EngineRuntimeDTO, EngineStatsDTO, EngineConfigDTO, SurvivalDTO, PriceHistoryDTO,
  EngineMarketsDTO, EnginePositionsDTO, EngineEventsDTO, EngineEdgesDTO,
  EngineHealth, HealthComponent, RuntimeComponents, EngineRuntime, EngineStats,
  EngineConfig, SurvivalStatus, PriceHistory,
  EngineMarkets, EnginePositions, EngineEvents, EngineEdges,
  EngineHealthStatus, SurvivalState, EngineMode,
} from '@/types/engine'

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

// ─── Engine shared helpers ────────────────────────────────────────────────────

function toHealthComponent(dto: HealthComponentDTO): HealthComponent {
  return {
    name:      dto.name,
    healthy:   dto.healthy,
    message:   dto.message,
    latencyMs: dto.latency_ms,
    checkedAt: isoToMs(dto.checked_at),
  }
}

function toRuntimeComponents(dto: RuntimeComponentsDTO): RuntimeComponents {
  return {
    bot:               dto.bot,
    clobClient:        dto.clob_client,
    executionEngine:   dto.execution_engine,
    marketFetcher:     dto.market_fetcher,
    resolutionTracker: dto.resolution_tracker,
    pnlCalculator:     dto.pnl_calculator,
    telegramAlerter:   dto.telegram_alerter,
    healthMonitor:     dto.health_monitor,
    survivalBrain:     dto.survival_brain,
    paperTrader:       dto.paper_trader,
  }
}

// ─── /health ─────────────────────────────────────────────────────────────────

export function toEngineHealth(dto: EngineHealthDTO): EngineHealth {
  return {
    status:          dto.status as EngineHealthStatus,
    components:      dto.components.map(toHealthComponent),
    checkDurationMs: dto.check_duration_ms,
    uptimeSeconds:   dto.uptime_seconds,
    stats: {
      healthChecks: dto.stats.health_checks,
      warnings:     dto.stats.warnings,
      errors:       dto.stats.errors,
      restarts:     dto.stats.restarts,
      lastWarning:  dto.stats.last_warning,
      lastError:    dto.stats.last_error,
    },
    timestamp: isoToMs(dto.timestamp),
  }
}

// ─── /api/runtime ─────────────────────────────────────────────────────────────

export function toEngineRuntime(dto: EngineRuntimeDTO): EngineRuntime {
  return {
    mode:          dto.mode as EngineMode,
    initializedAt: isoToMs(dto.initialized_at),
    components:    toRuntimeComponents(dto.components),
    stats: {
      startedAt:      isoToMs(dto.stats.started_at),
      edgesDetected:  dto.stats.edges_detected,
      ordersExecuted: dto.stats.orders_executed,
      totalPnl:       dto.stats.total_pnl,
    },
    timestamp: isoToMs(dto.timestamp),
  }
}

// ─── /api/stats ───────────────────────────────────────────────────────────────

export function toEngineStats(dto: EngineStatsDTO): EngineStats {
  return {
    currentPrice:       dto.current_price,
    feedLatencyMs:      dto.feed_latency_ms,
    feedConnected:      dto.feed_connected,
    activePositions:    dto.active_positions,
    edgesDetected:      dto.edges_detected,
    ordersExecuted:     dto.orders_executed,
    avgExecutionTimeMs: dto.avg_execution_time_ms,
    uptimeSeconds:      dto.uptime_seconds,
    unrealizedPnl:      dto.unrealized_pnl,
    realizedPnl:        dto.realized_pnl,
    totalPnl:           dto.total_pnl,
    healthStatus:       dto.health_status as EngineHealthStatus,
    healthComponents:   dto.health_components.map(toHealthComponent),
    runtimeComponents:  toRuntimeComponents(dto.runtime_components),
    timestamp:          isoToMs(dto.timestamp),
  }
}

// ─── /api/config ──────────────────────────────────────────────────────────────

export function toEngineConfig(dto: EngineConfigDTO): EngineConfig {
  const c = dto.config
  return {
    environment:               c.environment as EngineMode,
    anthropicApiKey:           c.anthropic_api_key,
    polymarketApiUrl:          c.polymarket_api_url,
    polygonChainId:            c.polygon_chain_id,
    initialBankroll:           c.initial_bankroll,
    maxBetPercent:             c.max_bet_percent,
    maxConcurrentPositions:    c.max_concurrent_positions,
    minEdge:                   c.min_edge,
    kellyFraction:             c.kelly_fraction,
    maxLatencyMs:              c.max_latency_ms,
    dashboardUpdateIntervalMs: c.dashboard_update_interval_ms,
    dashboardApiEnabled:       c.dashboard_api_enabled,
    dashboardApiHost:          c.dashboard_api_host,
    dashboardApiPort:          c.dashboard_api_port,
    logLevel:                  c.log_level,
  }
}

// ─── /api/survival ────────────────────────────────────────────────────────────

export function toSurvivalStatus(dto: SurvivalDTO): SurvivalStatus {
  return {
    currentCapital:       dto.current_capital,
    initialCapital:       dto.initial_capital,
    capitalPct:           dto.capital_pct,
    state:                dto.state as SurvivalState,
    dailyBurnRate:        dto.daily_burn_rate,
    daysOfRunway:         dto.days_of_runway,
    recoveryTradesNeeded: dto.recovery_trades_needed,
    avgWinSize:           dto.avg_win_size,
    dailyTarget:          dto.daily_target,
    weeklyTarget:         dto.weekly_target,
    dailyPnl:             dto.daily_pnl,
    weeklyPnl:            dto.weekly_pnl,
    behindTargetPct:      dto.behind_target_pct,
    kellyModifier:        dto.kelly_modifier,
    minEdgeThreshold:     dto.min_edge_threshold,
    totalPatterns:        dto.total_patterns,
    filteredPatterns:     dto.filtered_patterns,
    timestamp:            isoToMs(dto.timestamp),
    patternsSummary:      dto.patterns_summary,
  }
}

// ─── /api/price-history ───────────────────────────────────────────────────────

export function toPriceHistory(dto: PriceHistoryDTO): PriceHistory {
  return {
    current:   dto.current,
    history:   dto.history.map((p) => ({ ts: isoToMs(p.timestamp), price: p.price })),
    timestamp: isoToMs(dto.timestamp),
  }
}

// ─── /api/markets ─────────────────────────────────────────────────────────────

export function toEngineMarkets(dto: EngineMarketsDTO): EngineMarkets {
  return { markets: dto.markets, count: dto.count, timestamp: isoToMs(dto.timestamp) }
}

// ─── /api/positions ───────────────────────────────────────────────────────────

export function toEnginePositions(dto: EnginePositionsDTO): EnginePositions {
  return {
    positions:          dto.positions,
    count:              dto.count,
    totalUnrealizedPnl: dto.total_unrealized_pnl,
    timestamp:          isoToMs(dto.timestamp),
  }
}

// ─── /api/events ──────────────────────────────────────────────────────────────

export function toEngineEvents(dto: EngineEventsDTO): EngineEvents {
  return { events: dto.events, count: dto.count, limit: dto.limit, types: dto.types, timestamp: isoToMs(dto.timestamp) }
}

// ─── /api/edges ───────────────────────────────────────────────────────────────

export function toEngineEdges(dto: EngineEdgesDTO): EngineEdges {
  return { edges: dto.edges, count: dto.count, limit: dto.limit, timestamp: isoToMs(dto.timestamp) }
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
