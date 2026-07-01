// ─── Engine Portfolio mapper ──────────────────────────────────────────────────
//
// ✅ COVERAGE: /api/survival and /api/runtime are live.
//
// Maps survival + runtime → EnginePortfolioViewModel.
// This is a BOT-CENTRIC portfolio view — not a prediction-market PortfolioSummary
// replacement. It surfaces what the trading engine actually tracks:
//   capital position, daily/weekly P&L vs targets, trading activity, risk state.
//
// Intentionally separate from PortfolioSummary (src/types/portfolio.ts) which
// requires prediction-market position data (winRate, avgConsensusScore, etc.)
// that the engine cannot provide today.
//
// Component slot: useEnginePortfolio() → any new "Bot Performance" card or
// dashboard strip. The existing PortfolioMetrics component remains on mock data
// until /api/positions items are available.

import type { SurvivalStatus, EngineRuntime, SurvivalState, EngineMode } from '@/types/engine'

// ─── View model ───────────────────────────────────────────────────────────────

/**
 * Bot-centric portfolio snapshot derived from /api/survival + /api/runtime.
 * All monetary values are USD. All percentages are decimal (0.05 = 5%).
 */
export interface EnginePortfolioViewModel {
  // ── Capital ──────────────────────────────────────────────────────────────
  currentCapital:       number        // current bankroll (USD)
  initialCapital:       number        // starting bankroll (USD)
  capitalPct:           number        // current / initial ratio (0.0–∞)
  capitalChange:        number        // currentCapital − initialCapital (USD, signed)

  // ── P&L ──────────────────────────────────────────────────────────────────
  dailyPnl:             number        // today's P&L (USD, signed)
  weeklyPnl:            number        // this week's P&L (USD, signed)
  totalPnl:             number        // all-time P&L from runtime (USD, signed)
  dailyTarget:          number        // daily profit target (USD)
  weeklyTarget:         number        // weekly profit target (USD)
  dailyProgress:        number        // dailyPnl / dailyTarget, 0–1, capped
  weeklyProgress:       number        // weeklyPnl / weeklyTarget, 0–1, capped
  behindTargetPct:      number        // how far behind daily target (decimal)

  // ── Trading activity ─────────────────────────────────────────────────────
  ordersExecuted:       number        // lifetime order count
  edgesDetected:        number        // lifetime edges detected
  recoveryTradesNeeded: number        // trades needed to return to target

  // ── Risk ─────────────────────────────────────────────────────────────────
  state:                SurvivalState // 'HEALTHY' | 'CAUTION' | 'DANGER' | 'CRITICAL'
  daysOfRunway:         number | null // days of capital remaining at burn rate
  kellyModifier:        number        // position sizing multiplier (0–1)
  minEdgeThreshold:     number        // minimum edge required to trade
  dailyBurnRate:        number        // daily capital consumed (USD)

  // ── Pattern analysis ─────────────────────────────────────────────────────
  totalPatterns:        number        // raw patterns detected
  filteredPatterns:     number        // patterns passing edge threshold

  // ── Bot info ─────────────────────────────────────────────────────────────
  botMode:              EngineMode | null  // 'paper' | 'live'; null if runtime unavailable
  startedAt:            number | null       // epoch ms; null if runtime unavailable
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

/**
 * Build EnginePortfolioViewModel from survival + optional runtime.
 * Safe to call with runtime = null — runtime-derived fields default to 0 / null.
 */
export function toEnginePortfolio(
  survival: SurvivalStatus,
  runtime:  EngineRuntime | null,
): EnginePortfolioViewModel {
  const clamp = (v: number) => Math.max(0, Math.min(1, v))

  return {
    currentCapital:       survival.currentCapital,
    initialCapital:       survival.initialCapital,
    capitalPct:           survival.capitalPct / 100,                        // backend sends e.g. 95.2 → 0.952
    capitalChange:        survival.currentCapital - survival.initialCapital,

    dailyPnl:             survival.dailyPnl,
    weeklyPnl:            survival.weeklyPnl,
    totalPnl:             runtime?.stats.totalPnl     ?? 0,
    dailyTarget:          survival.dailyTarget,
    weeklyTarget:         survival.weeklyTarget,
    dailyProgress:        survival.dailyTarget  > 0
                            ? clamp(survival.dailyPnl  / survival.dailyTarget)
                            : 0,
    weeklyProgress:       survival.weeklyTarget > 0
                            ? clamp(survival.weeklyPnl / survival.weeklyTarget)
                            : 0,
    behindTargetPct:      survival.behindTargetPct,

    ordersExecuted:       runtime?.stats.ordersExecuted ?? 0,
    edgesDetected:        runtime?.stats.edgesDetected  ?? 0,
    recoveryTradesNeeded: survival.recoveryTradesNeeded,

    state:                survival.state,
    daysOfRunway:         survival.daysOfRunway,
    kellyModifier:        survival.kellyModifier,
    minEdgeThreshold:     survival.minEdgeThreshold,
    dailyBurnRate:        survival.dailyBurnRate,

    totalPatterns:        survival.totalPatterns,
    filteredPatterns:     survival.filteredPatterns,

    botMode:              runtime?.mode     ?? null,
    startedAt:            runtime?.stats.startedAt ?? null,
  }
}

// ─── Display helpers ─────────────────────────────────────────────────────────

/** State → CSS variable name for colour coding. */
export function survivalStateColor(state: SurvivalState): string {
  switch (state) {
    case 'HEALTHY':  return 'var(--probex-positive)'
    case 'CAUTION':  return 'var(--probex-warning)'
    case 'DANGER':   return 'var(--probex-negative)'
    case 'CRITICAL': return 'var(--probex-negative)'
  }
}

/** State → human-readable label. */
export function survivalStateLabel(state: SurvivalState): string {
  switch (state) {
    case 'HEALTHY':  return 'Healthy'
    case 'CAUTION':  return 'Caution'
    case 'DANGER':   return 'Danger'
    case 'CRITICAL': return 'Critical'
  }
}
