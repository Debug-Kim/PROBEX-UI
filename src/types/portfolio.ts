import type { BitcoinSegment } from './market'

// ─── Portfolio summary ────────────────────────────────────────────────────

export interface PortfolioSummary {
  totalValue:           number   // USD — cost basis of open positions
  currentValue:         number   // USD — current mark-to-market
  unrealizedPnl:        number   // USD
  unrealizedPnlPct:     number   // -1 to 1
  realizedPnl:          number   // USD — from settled positions
  totalDeployed:        number   // USD — all-time amount placed
  openPositionCount:    number
  settledPositionCount: number
  winCount:             number
  lossCount:            number
  winRate:              number   // 0–1
  avgWinReturn:         number   // USD average win profit
  avgLossReturn:        number   // USD average loss
  largestWin:           number   // USD
  largestLoss:          number   // USD
  avgConsensusScore:    number   // 0–1 — mean consensus on open positions
}

// ─── Allocation ──────────────────────────────────────────────────────────

export interface AllocationSlice {
  segment:  BitcoinSegment
  label:    string
  value:    number    // USD current value
  pct:      number    // 0–1
  count:    number    // number of positions
  pnl:      number    // unrealized PnL for segment
  colorVar: string    // CSS var for chart
}

// ─── Performance history ─────────────────────────────────────────────────

export interface PerformancePoint {
  timestamp:      number   // Unix ms
  portfolioValue: number   // USD total portfolio value
  cashBalance:    number   // USD available USDC
  deployedValue:  number   // USD in open positions
  cumulativePnl:  number   // USD realized + unrealized
  dailyPnl:       number   // USD change on this day
}

export interface WinRatePoint {
  timestamp: number
  winRate:   number   // 0–1 rolling 30d win rate
  totalBets: number   // cumulative position count
}

// ─── Portfolio activity ───────────────────────────────────────────────────

export type PortfolioEventType =
  | 'position-opened'
  | 'position-closed'
  | 'settlement-win'
  | 'settlement-loss'
  | 'payout-received'
  | 'watchlist-added'
  | 'consensus-alert'

export interface PortfolioActivityEvent {
  id:          string
  type:        PortfolioEventType
  marketId:    import('./branded').MarketId
  positionId?: import('./branded').PositionId
  marketTitle: string
  description: string
  amount?:     number    // USD
  timestamp:   number    // Unix ms
}
