// Wire DTOs (exact backend JSON shapes, snake_case) and camelCase domain types
// for all six confirmed engine endpoints. DTOs mirror the Postman collection
// responses literally — adapters in lib/services/dto.ts are the only
// translation point. No invented fields; no fields beyond what the captured
// samples contain.

// ─── Shared substructures ──────────────────────────────────────────────────────
// Both /health and /api/stats embed these component shapes.

/** Component health entry from /health components[] and /api/stats health_components[] */
export interface HealthComponentDTO {
  name:       string
  healthy:    boolean
  message:    string
  latency_ms: number | null  // null when not measured for this component
  checked_at: string         // ISO 8601
}

/** Runtime component flags from /api/runtime components{} and /api/stats runtime_components{} */
export interface RuntimeComponentsDTO {
  bot:                boolean
  clob_client:        boolean
  execution_engine:   boolean
  market_fetcher:     boolean
  resolution_tracker: boolean
  pnl_calculator:     boolean
  telegram_alerter:   boolean
  health_monitor:     boolean
  survival_brain:     boolean
  paper_trader:       boolean
}

// ─── /health ──────────────────────────────────────────────────────────────────

export interface HealthStatsDTO {
  health_checks: number
  warnings:      number
  errors:        number
  restarts:      number
  last_warning:  string | null
  last_error:    string | null
}

export interface EngineHealthDTO {
  status:            string              // 'online' | 'degraded' | 'offline'
  components:        HealthComponentDTO[]
  check_duration_ms: number
  uptime_seconds:    number
  stats:             HealthStatsDTO
  timestamp:         string             // ISO 8601
}

// ─── /api/runtime ─────────────────────────────────────────────────────────────

export interface RuntimeStatsDTO {
  started_at:      string   // ISO 8601
  edges_detected:  number
  orders_executed: number
  total_pnl:       number
}

export interface EngineRuntimeDTO {
  mode:           string   // 'paper' | 'live'
  initialized_at: string   // ISO 8601
  components:     RuntimeComponentsDTO
  stats:          RuntimeStatsDTO
  timestamp:      string   // ISO 8601
}

// ─── /api/stats ───────────────────────────────────────────────────────────────

export interface EngineStatsDTO {
  current_price:         number
  feed_latency_ms:       number
  feed_connected:        boolean
  active_positions:      number
  edges_detected:        number
  orders_executed:       number
  avg_execution_time_ms: number | null  // null until first execution
  uptime_seconds:        number
  unrealized_pnl:        number
  realized_pnl:          number
  total_pnl:             number
  health_status:         string
  health_components:     HealthComponentDTO[]
  runtime_components:    RuntimeComponentsDTO
  timestamp:             string  // ISO 8601
}

// ─── /api/config ──────────────────────────────────────────────────────────────

export interface EngineConfigInnerDTO {
  environment:                  string
  anthropic_api_key:            string | null  // redacted in paper mode
  polymarket_api_url:           string
  polygon_chain_id:             number
  initial_bankroll:             number
  max_bet_percent:              number
  max_concurrent_positions:     number
  min_edge:                     number
  kelly_fraction:               number
  max_latency_ms:               number
  dashboard_update_interval_ms: number
  dashboard_api_enabled:        boolean
  dashboard_api_host:           string
  dashboard_api_port:           number
  log_level:                    string
}

export interface EngineConfigDTO {
  config:    EngineConfigInnerDTO
  timestamp: string  // ISO 8601
}

// ─── /api/survival ────────────────────────────────────────────────────────────

export interface SurvivalDTO {
  current_capital:        number
  initial_capital:        number
  capital_pct:            number
  state:                  string    // 'HEALTHY' | 'CAUTION' | 'DANGER' | 'CRITICAL'
  daily_burn_rate:        number
  days_of_runway:         number | null  // null when burn rate is 0
  recovery_trades_needed: number
  avg_win_size:           number
  daily_target:           number
  weekly_target:          number
  daily_pnl:              number
  weekly_pnl:             number
  behind_target_pct:      number
  kelly_modifier:         number
  min_edge_threshold:     number
  total_patterns:         number
  filtered_patterns:      number
  timestamp:              string    // ISO 8601
  patterns_summary:       unknown[] // empty in all captured samples; item shape TBD
}

// ─── /api/price-history ───────────────────────────────────────────────────────

export interface PricePointDTO {
  timestamp: string  // ISO 8601 with Z suffix (UTC)
  price:     number
}

export interface PriceHistoryDTO {
  current:   number
  history:   PricePointDTO[]
  timestamp: string  // ISO 8601 without Z (backend omits timezone on envelope)
}

// ─── Domain types (camelCase; timestamps as epoch ms) ─────────────────────────

export type EngineMode         = 'paper' | 'live'
export type EngineHealthStatus = 'online' | 'degraded' | 'offline'
export type SurvivalState      = 'HEALTHY' | 'CAUTION' | 'DANGER' | 'CRITICAL'

export interface HealthComponent {
  name:      string
  healthy:   boolean
  message:   string
  latencyMs: number | null
  checkedAt: number          // epoch ms
}

export interface HealthStats {
  healthChecks: number
  warnings:     number
  errors:       number
  restarts:     number
  lastWarning:  string | null
  lastError:    string | null
}

export interface EngineHealth {
  status:          EngineHealthStatus
  components:      HealthComponent[]
  checkDurationMs: number
  uptimeSeconds:   number
  stats:           HealthStats
  timestamp:       number    // epoch ms
}

export interface RuntimeComponents {
  bot:               boolean
  clobClient:        boolean
  executionEngine:   boolean
  marketFetcher:     boolean
  resolutionTracker: boolean
  pnlCalculator:     boolean
  telegramAlerter:   boolean
  healthMonitor:     boolean
  survivalBrain:     boolean
  paperTrader:       boolean
}

export interface RuntimeStats {
  startedAt:      number    // epoch ms
  edgesDetected:  number
  ordersExecuted: number
  totalPnl:       number
}

export interface EngineRuntime {
  mode:          EngineMode
  initializedAt: number     // epoch ms
  components:    RuntimeComponents
  stats:         RuntimeStats
  timestamp:     number     // epoch ms
}

export interface EngineStats {
  currentPrice:       number
  feedLatencyMs:      number
  feedConnected:      boolean
  activePositions:    number
  edgesDetected:      number
  ordersExecuted:     number
  avgExecutionTimeMs: number | null
  uptimeSeconds:      number
  unrealizedPnl:      number
  realizedPnl:        number
  totalPnl:           number
  healthStatus:       EngineHealthStatus
  healthComponents:   HealthComponent[]
  runtimeComponents:  RuntimeComponents
  timestamp:          number  // epoch ms
}

export interface EngineConfig {
  environment:               EngineMode
  anthropicApiKey:           string | null
  polymarketApiUrl:          string
  polygonChainId:            number
  initialBankroll:           number
  maxBetPercent:             number
  maxConcurrentPositions:    number
  minEdge:                   number
  kellyFraction:             number
  maxLatencyMs:              number
  dashboardUpdateIntervalMs: number
  dashboardApiEnabled:       boolean
  dashboardApiHost:          string
  dashboardApiPort:          number
  logLevel:                  string
}

export interface SurvivalStatus {
  currentCapital:       number
  initialCapital:       number
  capitalPct:           number
  state:                SurvivalState
  dailyBurnRate:        number
  daysOfRunway:         number | null
  recoveryTradesNeeded: number
  avgWinSize:           number
  dailyTarget:          number
  weeklyTarget:         number
  dailyPnl:             number
  weeklyPnl:            number
  behindTargetPct:      number
  kellyModifier:        number
  minEdgeThreshold:     number
  totalPatterns:        number
  filteredPatterns:     number
  timestamp:            number    // epoch ms
  patternsSummary:      unknown[]
}

export interface PricePoint {
  ts:    number  // epoch ms
  price: number
}

export interface PriceHistory {
  current:   number
  history:   PricePoint[]
  timestamp: number  // epoch ms
}

// ─── /api/markets ─────────────────────────────────────────────────────────────
// Item schema not yet captured — always empty in Postman samples.

export interface EngineMarketsDTO {
  markets:   unknown[]
  count:     number
  timestamp: string  // ISO 8601
}

export interface EngineMarkets {
  markets:   unknown[]
  count:     number
  timestamp: number  // epoch ms
}

// ─── /api/positions ───────────────────────────────────────────────────────────

export interface EnginePositionsDTO {
  positions:            unknown[]
  count:                number
  total_unrealized_pnl: number
  timestamp:            string  // ISO 8601
}

export interface EnginePositions {
  positions:          unknown[]
  count:              number
  totalUnrealizedPnl: number
  timestamp:          number  // epoch ms
}

// ─── /api/events ──────────────────────────────────────────────────────────────

export interface EngineEventsDTO {
  events:    unknown[]
  count:     number
  limit:     number
  types:     string[] | null
  timestamp: string  // ISO 8601
}

export interface EngineEvents {
  events:    unknown[]
  count:     number
  limit:     number
  types:     string[] | null
  timestamp: number  // epoch ms
}

// ─── /api/edges ───────────────────────────────────────────────────────────────

export interface EngineEdgesDTO {
  edges:     unknown[]
  count:     number
  limit:     number
  timestamp: string  // ISO 8601
}

export interface EngineEdges {
  edges:     unknown[]
  count:     number
  limit:     number
  timestamp: number  // epoch ms
}
