// Aggregate portfolio metrics derived from position data.
// replace with IPortfolioService.getPortfolioSummary.

import type { BitcoinSegment } from '@/types/market'
import { MOCK_OPEN_POSITIONS, MOCK_SETTLED_POSITIONS } from './positions'

export type { PortfolioSummary, AllocationSlice } from '@/types/portfolio'
import type { PortfolioSummary, AllocationSlice } from '@/types/portfolio'

// ─── Computed summary ─────────────────────────────────────────────────────

export function computePortfolioSummary(): PortfolioSummary {
  const open     = MOCK_OPEN_POSITIONS
  const settled  = MOCK_SETTLED_POSITIONS

  const totalValue   = open.reduce((s, p) => s + p.costBasis, 0)
  const currentValue = open.reduce((s, p) => s + p.currentValue, 0)
  const unrealizedPnl = currentValue - totalValue
  const unrealizedPnlPct = totalValue > 0 ? unrealizedPnl / totalValue : 0

  // Realized: settled-win positions earned back their full payout
  const wins   = settled.filter((p) => p.status === 'settled-win')
  const losses = settled.filter((p) => p.status === 'settled-loss')

  // Win payout = contracts * 100¢ = currentValue when price=100¢
  const realizedPnl = wins.reduce((s, p) => s + (p.contracts - p.costBasis), 0)
    - losses.reduce((s, p) => s + p.costBasis, 0)

  const totalDeployed = [...open, ...settled].reduce((s, p) => s + p.costBasis, 0)

  const avgWin  = wins.length  ? wins.reduce((s, p)   => s + (p.contracts - p.costBasis), 0) / wins.length   : 0
  const avgLoss = losses.length? losses.reduce((s, p) => s + p.costBasis, 0) / losses.length                  : 0

  const winPnls  = wins.map((p)   => p.contracts - p.costBasis)
  const lossPnls = losses.map((p) => p.costBasis)

  // Average consensus from open positions (static approx from consensus map)
  const CONSENSUS_APPROX: Record<string, number> = {
    'btc-150k-dec-2026': 0.91, 'btc-etf-5b-q2': 0.84, 'btc-dominance-65': 0.74,
    'btc-20pct-drawdown': 0.61, 'btc-whale-accumulation': 0.82, 'ibit-100b-aum': 0.76,
    'btc-sp500-correlation': 0.46, 'btc-difficulty-ath': 0.83,
  }
  const avgConsensus = open.reduce((s, p) => s + (CONSENSUS_APPROX[p.marketId as string] ?? 0.65), 0) / (open.length || 1)

  return {
    totalValue,
    currentValue,
    unrealizedPnl,
    unrealizedPnlPct,
    realizedPnl,
    totalDeployed,
    openPositionCount:    open.length,
    settledPositionCount: settled.length,
    winCount:             wins.length,
    lossCount:            losses.length,
    winRate:              settled.length > 0 ? wins.length / settled.length : 0,
    avgWinReturn:         avgWin,
    avgLossReturn:        avgLoss,
    largestWin:           winPnls.length  ? Math.max(...winPnls)  : 0,
    largestLoss:          lossPnls.length ? Math.max(...lossPnls) : 0,
    avgConsensusScore:    avgConsensus,
  }
}

// ─── Allocation by segment ────────────────────────────────────────────────

const SEGMENT_LABELS: Record<BitcoinSegment, string> = {
  'price-targets':          'Price Targets',
  'volatility':             'Volatility',
  'etf-flows':              'ETF Flows',
  'on-chain-metrics':       'On-Chain',
  'network-health':         'Network',
  'institutional-activity': 'Institutional',
  'macro-signals':          'Macro Signals',
  'market-structure':       'Market Structure',
}

// Cycle through theme-safe color vars for chart segments
const SEGMENT_COLORS: Partial<Record<BitcoinSegment, string>> = {
  'price-targets':    'var(--probex-primary)',
  'etf-flows':        'var(--probex-positive)',
  'on-chain-metrics': 'var(--probex-secondary)',
  'volatility':       'var(--probex-warning)',
  'network-health':   'var(--probex-negative)',
  'macro-signals':    '#60A5FA',
  'market-structure': '#A78BFA',
  'institutional-activity': '#34D399',
}

export function computeAllocationBySegment(): AllocationSlice[] {
  const positions = MOCK_OPEN_POSITIONS
  const total     = positions.reduce((s, p) => s + p.currentValue, 0)

  const bySegment: Partial<Record<BitcoinSegment, {
    value: number; count: number; pnl: number
  }>> = {}

  for (const pos of positions) {
    const seg  = pos.segment as BitcoinSegment
    const curr = bySegment[seg] ?? { value: 0, count: 0, pnl: 0 }
    bySegment[seg] = {
      value: curr.value + pos.currentValue,
      count: curr.count + 1,
      pnl:   curr.pnl   + pos.unrealizedPnl,
    }
  }

  return Object.entries(bySegment)
    .map(([seg, data]) => ({
      segment:  seg as BitcoinSegment,
      label:    SEGMENT_LABELS[seg as BitcoinSegment] ?? seg,
      value:    data.value,
      pct:      total > 0 ? data.value / total : 0,
      count:    data.count,
      pnl:      data.pnl,
      colorVar: SEGMENT_COLORS[seg as BitcoinSegment] ?? 'var(--probex-text-muted)',
    }))
    .sort((a, b) => b.value - a.value)
}
