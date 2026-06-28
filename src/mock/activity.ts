/**
 * Activity Feed Mock Data
 * ───────────────────────
 * Platform-wide activity events for the dashboard feed.
 * Deterministic base data + time-relative display.
 */

import type { MarketId } from '@/types/branded'
import { asMarketId } from '@/types/branded'

// ─── Types ────────────────────────────────────────────────────────────────

export type ActivityType =
  | 'new-position-yes'
  | 'new-position-no'
  | 'market-resolved'
  | 'consensus-shift'
  | 'probability-spike'
  | 'large-position'

export interface ActivityItem {
  id:          string
  type:        ActivityType
  marketId:    MarketId
  marketTitle: string
  segment:     string
  description: string
  amount?:     number     // USD
  probability?: number    // current probability
  timestamp:   number     // Unix ms
}

// ─── Base activity data ────────────────────────────────────────────────────

const now = Date.now()

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id:           'act-001',
    type:         'large-position',
    marketId:     asMarketId('btc-150k-dec-2026'),
    marketTitle:  'BTC > $150K by Dec 2026',
    segment:      'Price Targets',
    description:  'Large YES position opened',
    amount:       18_500,
    probability:  0.67,
    timestamp:    now - 45_000,
  },
  {
    id:           'act-002',
    type:         'consensus-shift',
    marketId:     asMarketId('btc-etf-5b-q2'),
    marketTitle:  'BTC ETF inflows exceed $5B this quarter',
    segment:      'ETF Flows',
    description:  'Consensus score increased to 84%',
    probability:  0.72,
    timestamp:    now - 92_000,
  },
  {
    id:           'act-003',
    type:         'new-position-yes',
    marketId:     asMarketId('btc-100k-jun-2026'),
    marketTitle:  'BTC > $100K by end of June',
    segment:      'Price Targets',
    description:  'New YES position',
    amount:       4_200,
    probability:  0.78,
    timestamp:    now - 140_000,
  },
  {
    id:           'act-004',
    type:         'probability-spike',
    marketId:     asMarketId('btc-dominance-65'),
    marketTitle:  'BTC dominance exceeds 65% by Q3',
    segment:      'Market Structure',
    description:  'Probability moved +4.2% in 1 hour',
    probability:  0.58,
    timestamp:    now - 210_000,
  },
  {
    id:           'act-005',
    type:         'new-position-no',
    marketId:     asMarketId('btc-20pct-drawdown'),
    marketTitle:  'BTC experiences 20%+ drawdown',
    segment:      'Volatility',
    description:  'New NO position',
    amount:       2_800,
    probability:  0.55,
    timestamp:    now - 320_000,
  },
  {
    id:           'act-006',
    type:         'large-position',
    marketId:     asMarketId('ibit-100b-aum'),
    marketTitle:  'BlackRock IBIT surpasses $100B AUM',
    segment:      'ETF Flows',
    description:  'Institutional YES position opened',
    amount:       42_000,
    probability:  0.61,
    timestamp:    now - 480_000,
  },
  {
    id:           'act-007',
    type:         'consensus-shift',
    marketId:     asMarketId('btc-whale-accumulation'),
    marketTitle:  'Whale wallets net accumulation positive',
    segment:      'On-Chain',
    description:  'Institutional bias shifted to Bullish',
    probability:  0.71,
    timestamp:    now - 650_000,
  },
  {
    id:           'act-008',
    type:         'new-position-yes',
    marketId:     asMarketId('microstrategy-500k-btc'),
    marketTitle:  'MicroStrategy holds > 500K BTC',
    segment:      'Institutional',
    description:  'New YES position',
    amount:       9_100,
    probability:  0.62,
    timestamp:    now - 900_000,
  },
  {
    id:           'act-009',
    type:         'probability-spike',
    marketId:     asMarketId('btc-120k-ath'),
    marketTitle:  'BTC reaches new ATH above $120K',
    segment:      'Price Targets',
    description:  'Probability moved +6.1% in 2 hours',
    probability:  0.81,
    timestamp:    now - 1_200_000,
  },
  {
    id:           'act-010',
    type:         'new-position-yes',
    marketId:     asMarketId('fed-cut-twice-2026'),
    marketTitle:  'Fed cuts rates at least twice in 2026',
    segment:      'Macro Signals',
    description:  'New YES position',
    amount:       3_400,
    probability:  0.57,
    timestamp:    now - 1_800_000,
  },
]

// ─── Activity type display helpers ────────────────────────────────────────

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  'new-position-yes':  'YES position',
  'new-position-no':   'NO position',
  'market-resolved':   'Market resolved',
  'consensus-shift':   'Consensus shift',
  'probability-spike': 'Probability spike',
  'large-position':    'Large position',
}

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  'new-position-yes':  'var(--probex-yes)',
  'new-position-no':   'var(--probex-no)',
  'market-resolved':   'var(--probex-positive)',
  'consensus-shift':   'var(--probex-primary)',
  'probability-spike': 'var(--probex-warning)',
  'large-position':    'var(--probex-positive)',
}
