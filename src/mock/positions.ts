/**
 * Position Mock Data
 * ───────────────────
 * All positions reference real market IDs from mock/markets.ts.
 * Consensus alignment is computed from MOCK_CONSENSUS_MAP at read time.
 * replace with IPortfolioService.getPositions.
 */

import type { Position, PositionSide, PositionStatus } from '@/types/wallet'
import {
  asPositionId,
  asMarketId,
  asOrderId,
} from '@/types/branded'
import type { BitcoinSegment } from '@/types/market'

// ─── Factory ──────────────────────────────────────────────────────────────

function pos(
  id:           string,
  marketId:     string,
  marketTitle:  string,
  segment:      BitcoinSegment,
  side:         PositionSide,
  contracts:    number,
  entryPrice:   number,    // cents
  currentPrice: number,    // cents
  openedAt:     string,
  status:       PositionStatus = 'open',
  closedAt:     string | null = null,
): Position {
  const costBasis     = (contracts * entryPrice)  / 100
  const currentValue  = (contracts * currentPrice) / 100
  const unrealizedPnl = currentValue - costBasis
  const unrealizedPnlPct = costBasis > 0 ? unrealizedPnl / costBasis : 0

  return {
    id:              asPositionId(id),
    marketId:        asMarketId(marketId),
    marketTitle,
    segment,
    side,
    contracts,
    entryPrice,
    currentPrice,
    costBasis,
    currentValue,
    unrealizedPnl,
    unrealizedPnlPct,
    status,
    openedAt,
    closedAt,
    orderId:         asOrderId(`ord-${id}`),
  }
}

// ─── Open Positions ────────────────────────────────────────────────────────

export const MOCK_OPEN_POSITIONS: Position[] = [
  pos(
    'pos-001', 'btc-150k-dec-2026',
    'BTC > $150,000 by Dec 31, 2026',
    'price-targets', 'yes', 500, 62, 67,
    '2026-05-12T09:23:00Z',
  ),
  pos(
    'pos-002', 'btc-etf-5b-q2',
    'BTC ETF inflows exceed $5B this quarter',
    'etf-flows', 'yes', 300, 68, 72,
    '2026-05-18T14:05:00Z',
  ),
  pos(
    'pos-003', 'btc-dominance-65',
    'BTC dominance exceeds 65% by end of Q3 2026',
    'market-structure', 'yes', 800, 54, 58,
    '2026-05-22T11:30:00Z',
  ),
  pos(
    'pos-004', 'btc-20pct-drawdown',
    'BTC experiences a 20%+ drawdown from ATH in 2026',
    'volatility', 'no', 400, 42, 45,
    '2026-06-01T08:45:00Z',
  ),
  pos(
    'pos-005', 'btc-whale-accumulation',
    'Whale wallets net accumulation positive this month',
    'on-chain-metrics', 'yes', 200, 69, 71,
    '2026-06-05T16:20:00Z',
  ),
  pos(
    'pos-006', 'ibit-100b-aum',
    'BlackRock IBIT surpasses $100B AUM by year-end',
    'etf-flows', 'yes', 150, 58, 61,
    '2026-06-08T10:15:00Z',
  ),
  pos(
    'pos-007', 'btc-sp500-correlation',
    'BTC correlation with S&P 500 drops below 0.3 in Q3',
    'macro-signals', 'no', 600, 61, 62,
    '2026-06-09T13:40:00Z',
  ),
  pos(
    'pos-008', 'btc-difficulty-ath',
    'BTC mining difficulty sets new ATH this quarter',
    'network-health', 'yes', 350, 73, 76,
    '2026-06-10T09:00:00Z',
  ),
]

// ─── Settled Positions ────────────────────────────────────────────────────

export const MOCK_SETTLED_POSITIONS: Position[] = [
  pos(
    'pos-s001', 'btc-100k-jun-2026',
    'BTC > $100,000 by end of June 2026',
    'price-targets', 'yes', 1000, 71, 100,
    '2026-04-10T10:00:00Z',
    'settled-win', '2026-06-30T23:59:00Z',
  ),
  pos(
    'pos-s002', 'btc-exchange-reserve',
    'BTC exchange reserve falls below 2M coins',
    'on-chain-metrics', 'yes', 500, 60, 100,
    '2026-03-15T08:30:00Z',
    'settled-win', '2026-05-20T16:00:00Z',
  ),
  pos(
    'pos-s003', 'btc-hashrate-1zh',
    'BTC hashrate reaches 1 ZH/s by Dec 2026',
    'network-health', 'yes', 200, 36, 0,
    '2026-02-20T12:00:00Z',
    'settled-loss', '2026-05-01T00:00:00Z',
  ),
  pos(
    'pos-s004', 'btc-etf-positive-10wk',
    'Net BTC ETF flows positive for 10 consecutive weeks',
    'etf-flows', 'yes', 400, 55, 100,
    '2026-03-01T09:00:00Z',
    'settled-win', '2026-05-15T12:00:00Z',
  ),
  pos(
    'pos-s005', 'fed-cut-twice-2026',
    'Fed cuts rates at least twice before year-end 2026',
    'macro-signals', 'yes', 300, 48, 0,
    '2026-01-25T11:00:00Z',
    'settled-loss', '2026-04-30T23:59:00Z',
  ),
  pos(
    'pos-s006', 'btc-120k-ath',
    'BTC reaches new ATH above $120,000',
    'price-targets', 'yes', 600, 74, 100,
    '2026-02-10T14:00:00Z',
    'settled-win', '2026-05-28T09:15:00Z',
  ),
]

// ─── All positions ─────────────────────────────────────────────────────────

export const ALL_POSITIONS: Position[] = [
  ...MOCK_OPEN_POSITIONS,
  ...MOCK_SETTLED_POSITIONS,
]

// ─── Lookup helpers ────────────────────────────────────────────────────────

export function getOpenPositions(): Position[] {
  return MOCK_OPEN_POSITIONS
}

export function getSettledPositions(): Position[] {
  return MOCK_SETTLED_POSITIONS
}

export function getPositionById(id: string): Position | undefined {
  return ALL_POSITIONS.find((p) => p.id === id)
}

export function getPositionsByMarket(marketId: string): Position[] {
  return ALL_POSITIONS.filter((p) => p.marketId === marketId)
}
