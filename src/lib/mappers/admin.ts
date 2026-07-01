// Maps survival + runtime engine data → admin risk dashboard view models.
//
// ✅ COVERAGE: survivalToRiskDashboard — /api/survival is live, /api/runtime is live.
//    alerts and exposureSeries are always [] — no dedicated alert/time-series endpoints.

import type { SurvivalStatus, EngineRuntime } from '@/types/engine'
import type { RiskMetric, RiskDashboard } from '@/types/admin'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Level = RiskMetric['level']

function survivalLevel(state: string): Level {
  if (state === 'CRITICAL') return 'critical'
  if (state === 'DANGER')   return 'elevated'
  if (state === 'CAUTION')  return 'elevated'
  return 'ok'
}

function pnlSign(n: number): string {
  return n >= 0 ? '+' : ''
}

// ─── SurvivalStatus + EngineRuntime → RiskDashboard ──────────────────────────

/**
 * Converts survival + runtime data to the RiskDashboard view model consumed by
 * the admin RiskDashboard panel (src/components/admin/RiskDashboard.tsx).
 *
 * Mapping decisions:
 *  • Capital / state → top-level risk level badge
 *  • Runway: 'critical' when < 3d, 'elevated' when < 7d
 *  • Daily P&L: 'critical' when loss > 2% of initial capital
 *  • Kelly Modifier: 'critical' when < 50%, 'elevated' when < 85%
 *  • Total P&L row added only when runtime data is available
 *  • alerts: always [] — no alert feed endpoint
 *  • exposureSeries: always [] — no time-series endpoint
 */
export function survivalToRiskDashboard(
  survival: SurvivalStatus,
  runtime:  EngineRuntime | null,
): RiskDashboard {
  const topLevel = survivalLevel(survival.state)
  const lossCriticalThreshold = survival.initialCapital * 0.02

  const metrics: RiskMetric[] = [
    {
      label: 'Capital',
      value: `$${survival.currentCapital.toFixed(2)}`,
      delta: survival.currentCapital - survival.initialCapital,
      level: topLevel,
      hint:  `${survival.capitalPct.toFixed(1)}% of initial $${survival.initialCapital}`,
    },
    {
      label: 'Runway',
      value: survival.daysOfRunway !== null
        ? `${survival.daysOfRunway.toFixed(1)} days`
        : '∞',
      delta: 0,
      level: survival.daysOfRunway !== null && survival.daysOfRunway < 3 ? 'critical'
           : survival.daysOfRunway !== null && survival.daysOfRunway < 7 ? 'elevated'
           : 'ok',
      hint:  survival.dailyBurnRate > 0
        ? `$${survival.dailyBurnRate.toFixed(2)}/day burn`
        : 'No active burn',
    },
    {
      label: 'Daily P&L',
      value: `${pnlSign(survival.dailyPnl)}$${survival.dailyPnl.toFixed(2)}`,
      delta: survival.dailyPnl,
      level: survival.dailyPnl < -lossCriticalThreshold ? 'critical'
           : survival.dailyPnl < 0                      ? 'elevated'
           : 'ok',
      hint:  `Target: $${survival.dailyTarget}/day`,
    },
    {
      label: 'Kelly Modifier',
      value: `${(survival.kellyModifier * 100).toFixed(0)}%`,
      delta: 0,
      level: survival.kellyModifier < 0.5  ? 'critical'
           : survival.kellyModifier < 0.85 ? 'elevated'
           : 'ok',
      hint:  `Min edge: ${survival.minEdgeThreshold.toFixed(1)}%`,
    },
  ]

  if (runtime) {
    metrics.push({
      label: 'Total P&L',
      value: `${pnlSign(runtime.stats.totalPnl)}$${runtime.stats.totalPnl.toFixed(2)}`,
      delta: runtime.stats.totalPnl,
      level: runtime.stats.totalPnl < 0 ? 'elevated' : 'ok',
      hint:  `${runtime.stats.ordersExecuted} orders · ${runtime.stats.edgesDetected} edges`,
    })
  }

  return {
    metrics,
    alerts:         [], // no alert-feed endpoint
    exposureSeries: [], // no time-series endpoint
  }
}
