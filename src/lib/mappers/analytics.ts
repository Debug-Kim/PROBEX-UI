// Maps survival + runtime engine data → BotPnLView, a normalized analytics
// view model ready for any component that wants to display bot performance.
//
// ✅ COVERAGE: /api/survival and /api/runtime are live.
//    No prediction-market analytics (consensus, ETF, on-chain) can be derived
//    from engine data — those sections remain on mock data.

import type { SurvivalStatus, EngineRuntime } from '@/types/engine'

// ─── View model ───────────────────────────────────────────────────────────────

/** Normalized bot P&L and survival analytics ready for UI consumption. */
export interface BotPnLView {
  // Capital
  currentCapital:    number
  initialCapital:    number
  capitalChangePct:  number     // signed delta vs initial (e.g. -2.5 = lost 2.5%)

  // P&L
  dailyPnl:         number
  weeklyPnl:        number
  totalPnl:         number      // from runtime.stats.totalPnl; 0 if runtime unavailable

  // Targets (progress 0–1, capped)
  dailyTarget:      number
  weeklyTarget:     number
  dailyProgress:    number
  weeklyProgress:   number

  // Bot health
  state:            string      // 'HEALTHY' | 'CAUTION' | 'DANGER' | 'CRITICAL'
  daysOfRunway:     number | null

  // Trading activity
  ordersExecuted:   number
  edgesDetected:    number

  // Risk parameters
  kellyModifier:    number
  minEdgeThreshold: number
  totalPatterns:    number
  filteredPatterns: number
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

/**
 * Converts survival + optional runtime into BotPnLView.
 * Safe to call with runtime = null (runtime fields default to 0).
 */
export function toBotPnLView(
  survival: SurvivalStatus,
  runtime:  EngineRuntime | null,
): BotPnLView {
  return {
    currentCapital:   survival.currentCapital,
    initialCapital:   survival.initialCapital,
    capitalChangePct: survival.capitalPct - 100,

    dailyPnl:         survival.dailyPnl,
    weeklyPnl:        survival.weeklyPnl,
    totalPnl:         runtime?.stats.totalPnl    ?? 0,

    dailyTarget:      survival.dailyTarget,
    weeklyTarget:     survival.weeklyTarget,
    dailyProgress:    survival.dailyTarget > 0
                        ? Math.min(1, survival.dailyPnl  / survival.dailyTarget)
                        : 0,
    weeklyProgress:   survival.weeklyTarget > 0
                        ? Math.min(1, survival.weeklyPnl / survival.weeklyTarget)
                        : 0,

    state:            survival.state,
    daysOfRunway:     survival.daysOfRunway,

    ordersExecuted:   runtime?.stats.ordersExecuted ?? 0,
    edgesDetected:    runtime?.stats.edgesDetected  ?? 0,

    kellyModifier:    survival.kellyModifier,
    minEdgeThreshold: survival.minEdgeThreshold,
    totalPatterns:    survival.totalPatterns,
    filteredPatterns: survival.filteredPatterns,
  }
}
