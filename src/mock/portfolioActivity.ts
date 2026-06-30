// Account-level activity feed: position opens, closes, settlements,
// payouts, watchlist actions, and consensus signal alerts that affected
// the user's open positions.
//
// replace with IPortfolioService.getActivity.

import { asMarketId, asPositionId }  from '@/types/branded'

export type { PortfolioEventType, PortfolioActivityEvent } from '@/types/portfolio'
import type { PortfolioEventType, PortfolioActivityEvent } from '@/types/portfolio'

const now = Date.now()

export const MOCK_PORTFOLIO_ACTIVITY: PortfolioActivityEvent[] = [
  {
    id: 'pa-001', type: 'consensus-alert',
    marketId: asMarketId('btc-150k-dec-2026'), positionId: asPositionId('pos-001'),
    marketTitle: 'BTC > $150,000 by Dec 31, 2026',
    description: 'Consensus score rose to 91% — strong institutional accumulation signal',
    timestamp: now - 1_800_000,
  },
  {
    id: 'pa-002', type: 'position-opened',
    marketId: asMarketId('btc-difficulty-ath'), positionId: asPositionId('pos-008'),
    marketTitle: 'BTC mining difficulty sets new ATH this quarter',
    description: 'Opened YES position · 350 contracts @ 73¢',
    amount: 255.50,
    timestamp: now - 3_600_000 * 6,
  },
  {
    id: 'pa-003', type: 'payout-received',
    marketId: asMarketId('btc-120k-ath'), positionId: asPositionId('pos-s006'),
    marketTitle: 'BTC reaches new ATH above $120,000',
    description: 'Market resolved YES — full payout received',
    amount: 600.00,
    timestamp: now - 3_600_000 * 18,
  },
  {
    id: 'pa-004', type: 'settlement-win',
    marketId: asMarketId('btc-120k-ath'), positionId: asPositionId('pos-s006'),
    marketTitle: 'BTC reaches new ATH above $120,000',
    description: 'Position settled WIN · entered at 74¢, resolved YES',
    amount: 156.00,
    timestamp: now - 3_600_000 * 18 - 60_000,
  },
  {
    id: 'pa-005', type: 'watchlist-added',
    marketId: asMarketId('btc-200k-2026'),
    marketTitle: 'BTC > $200,000 at any point in 2026',
    description: 'Added to watchlist',
    timestamp: now - 3_600_000 * 30,
  },
  {
    id: 'pa-006', type: 'position-opened',
    marketId: asMarketId('btc-sp500-correlation'), positionId: asPositionId('pos-007'),
    marketTitle: 'BTC correlation with S&P 500 drops below 0.3 in Q3',
    description: 'Opened NO position · 600 contracts @ 61¢',
    amount: 366.00,
    timestamp: now - 3_600_000 * 36,
  },
  {
    id: 'pa-007', type: 'consensus-alert',
    marketId: asMarketId('btc-whale-accumulation'), positionId: asPositionId('pos-005'),
    marketTitle: 'Whale wallets net accumulation positive this month',
    description: 'Institutional participation increased to 78% — alignment strengthened',
    timestamp: now - 3_600_000 * 48,
  },
  {
    id: 'pa-008', type: 'settlement-loss',
    marketId: asMarketId('fed-cut-twice-2026'), positionId: asPositionId('pos-s005'),
    marketTitle: 'Fed cuts rates at least twice before year-end 2026',
    description: 'Position settled LOSS · entered at 48¢, resolved NO',
    amount: -144.00,
    timestamp: now - 3_600_000 * 60,
  },
  {
    id: 'pa-009', type: 'position-opened',
    marketId: asMarketId('ibit-100b-aum'), positionId: asPositionId('pos-006'),
    marketTitle: 'BlackRock IBIT surpasses $100B AUM by year-end',
    description: 'Opened YES position · 150 contracts @ 58¢',
    amount: 87.00,
    timestamp: now - 3_600_000 * 72,
  },
  {
    id: 'pa-010', type: 'payout-received',
    marketId: asMarketId('btc-etf-positive-10wk'), positionId: asPositionId('pos-s004'),
    marketTitle: 'Net BTC ETF flows positive for 10 consecutive weeks',
    description: 'Market resolved YES — full payout received',
    amount: 400.00,
    timestamp: now - 3_600_000 * 96,
  },
  {
    id: 'pa-011', type: 'consensus-alert',
    marketId: asMarketId('btc-etf-5b-q2'), positionId: asPositionId('pos-002'),
    marketTitle: 'BTC ETF inflows exceed $5B this quarter',
    description: 'Signal strength upgraded to Strong — Q2 pace ahead of target',
    timestamp: now - 3_600_000 * 110,
  },
  {
    id: 'pa-012', type: 'position-closed',
    marketId: asMarketId('btc-hashrate-1zh'), positionId: asPositionId('pos-s003'),
    marketTitle: 'BTC hashrate reaches 1 ZH/s by Dec 2026',
    description: 'Position settled LOSS · entered at 36¢, resolved NO',
    amount: -72.00,
    timestamp: now - 3_600_000 * 140,
  },
]

// ─── Display helpers ────────────────────────────────────────────────────

export const PORTFOLIO_EVENT_LABELS: Record<PortfolioEventType, string> = {
  'position-opened':  'Position Opened',
  'position-closed':  'Position Closed',
  'settlement-win':   'Settled — Win',
  'settlement-loss':  'Settled — Loss',
  'payout-received':  'Payout',
  'watchlist-added':  'Watchlist',
  'consensus-alert':  'Consensus Alert',
}

export const PORTFOLIO_EVENT_COLORS: Record<PortfolioEventType, string> = {
  'position-opened':  'var(--probex-primary)',
  'position-closed':  'var(--probex-text-muted)',
  'settlement-win':   'var(--probex-positive)',
  'settlement-loss':  'var(--probex-negative)',
  'payout-received':  'var(--probex-positive)',
  'watchlist-added':  'var(--probex-warning)',
  'consensus-alert':  'var(--probex-primary)',
}

export const PORTFOLIO_EVENT_ICONS: Record<PortfolioEventType, string> = {
  'position-opened':  '+',
  'position-closed':  '×',
  'settlement-win':   '✓',
  'settlement-loss':  '✗',
  'payout-received':  '$',
  'watchlist-added':  '★',
  'consensus-alert':  '⚡',
}

export function getPortfolioActivity(limit = 20): PortfolioActivityEvent[] {
  return MOCK_PORTFOLIO_ACTIVITY.slice(0, limit)
}
