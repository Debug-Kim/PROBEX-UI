// Portfolio value / P&L time-series from account inception (Jan 2026) to present.
// Replace with IPortfolioService.getPerformanceHistory.

export type { PerformancePoint, WinRatePoint } from '@/types/portfolio'
import type { PerformancePoint, WinRatePoint } from '@/types/portfolio'

// ─── Generator ────────────────────────────────────────────────────────────

const START_TS  = new Date('2026-01-15T00:00:00Z').getTime()
const NOW_TS    = Date.now()
const DAY_MS    = 86_400_000

/**
 * Generates deterministic portfolio performance history.
 * Models a trader who started with $10,000, deploying capital
 * across Bitcoin prediction markets with ~62% win rate.
 */
export function generatePerformanceHistory(): PerformancePoint[] {
  const days   = Math.ceil((NOW_TS - START_TS) / DAY_MS)
  const points: PerformancePoint[] = []

  let cash    = 10_000     // starting balance
  let deployed = 0
  let cumPnl   = 0

  const seed = 42
  const rand  = (i: number) => {
    const x = Math.sin(seed * 9301 + i * 49297 + 233) * 14159
    return Math.abs(x - Math.floor(x))
  }

  for (let d = 0; d < days; d++) {
    const ts    = START_TS + d * DAY_MS
    const r     = rand(d)
    const r2    = rand(d + 1000)

    // Deploy capital on some days
    if (r > 0.7 && cash > 100) {
      const amount = Math.min(cash * 0.2, 500 + r2 * 800)
      cash    -= amount
      deployed += amount
    }

    // Settle positions on some days (62% win rate)
    if (r > 0.55 && deployed > 50) {
      const settleAmount  = deployed * 0.12 * (0.5 + r2)
      const isWin         = r2 > 0.38           // 62% win rate
      const pnl           = isWin ? settleAmount * 0.45 : -settleAmount * 0.85
      deployed -= settleAmount
      cash     += settleAmount + pnl
      cumPnl   += pnl
    }

    // Small daily mark-to-market drift
    const drift = (rand(d + 500) - 0.47) * 80
    cumPnl     += drift
    const totalValue = cash + deployed + Math.max(-500, Math.min(1500, cumPnl))

    points.push({
      timestamp:      ts,
      portfolioValue: Math.max(8000, totalValue),
      cashBalance:    Math.max(0, cash),
      deployedValue:  Math.max(0, deployed),
      cumulativePnl:  cumPnl,
      dailyPnl:       drift + (isFinite(drift) ? 0 : 0),
    })
  }

  return points
}

/**
 * Generate rolling win rate history.
 */
export function generateWinRateHistory(): WinRatePoint[] {
  const days   = Math.ceil((NOW_TS - START_TS) / DAY_MS)
  const points: WinRatePoint[] = []
  let totalBets = 0
  let wins      = 0

  const rand = (i: number) => {
    const x = Math.sin(42 * 9301 + i * 49297 + 233) * 14159
    return Math.abs(x - Math.floor(x))
  }

  for (let d = 0; d < days; d++) {
    const r = rand(d)
    if (r > 0.55) {
      totalBets++
      if (rand(d + 200) > 0.38) wins++
    }
    if (d % 7 === 0) {  // weekly snapshots
      points.push({
        timestamp:  START_TS + d * DAY_MS,
        winRate:    totalBets > 0 ? wins / totalBets : 0,
        totalBets,
      })
    }
  }

  return points
}

/**
 * Returns last N days of performance.
 */
export function getRecentPerformance(days = 30): PerformancePoint[] {
  return generatePerformanceHistory().slice(-days)
}

/**
 * Returns the current portfolio snapshot (last point).
 */
export function getCurrentPortfolioSnapshot(): PerformancePoint {
  const history = generatePerformanceHistory()
  const last    = history.at(-1)
  if (!last) {
    return {
      timestamp: Date.now(), portfolioValue: 10000,
      cashBalance: 5000, deployedValue: 5000,
      cumulativePnl: 0, dailyPnl: 0,
    }
  }
  return last
}
