// Defines the full taxonomy of Bitcoin prediction markets on Probex MVP.
//
// Architecture note:
//   This config drives category tabs, filter dropdowns, sidebar labels,
//   and API query parameters. Never use raw segment ID strings in components —
//   always reference this config. Future asset classes (ETH, SOL, etc.) will
//   follow the same pattern with their own segment configs.

import type { BitcoinSegment, SegmentMeta } from '@/types/market'

// ─── Segment display config ───────────────────────────────────────────────

export interface SegmentDisplayConfig extends SegmentMeta {
  /** Short label for compact views (category pills, mobile) */
  readonly shortLabel: string
  /** Color token name for segment accent (maps to CSS var) */
  readonly accentColor: string
  /** Example market titles shown in tooltips / onboarding */
  readonly exampleMarkets: readonly string[]
  /** Whether this segment is featured on the home dashboard */
  readonly isFeatured: boolean
}

export const MARKET_SEGMENTS: Record<BitcoinSegment, SegmentDisplayConfig> = {
  'price-targets': {
    id:          'price-targets',
    label:       'Price Targets',
    shortLabel:  'Price',
    description: 'BTC price level predictions — end-of-period price targets',
    icon:        'TrendingUp',
    sortOrder:   1,
    accentColor: 'var(--probex-primary)',
    isFeatured:  true,
    exampleMarkets: [
      'BTC > $150,000 by Dec 2026',
      'BTC closes Q4 above $180,000',
      'BTC > $100,000 by end of June 2026',
      'BTC reaches new ATH above $120,000',
    ],
  },

  'volatility': {
    id:          'volatility',
    label:       'Volatility',
    shortLabel:  'Vol',
    description: 'Implied and realized volatility market predictions',
    icon:        'Activity',
    sortOrder:   2,
    accentColor: 'var(--probex-warning)',
    isFeatured:  true,
    exampleMarkets: [
      'BTC 30-day realized vol exceeds 80% in Q3',
      'BTC implied volatility index above 70 this month',
      'BTC experiences a 20%+ drawdown in 2026',
    ],
  },

  'etf-flows': {
    id:          'etf-flows',
    label:       'ETF Flows',
    shortLabel:  'ETF',
    description: 'Bitcoin ETF inflow, outflow, and AUM predictions',
    icon:        'ArrowLeftRight',
    sortOrder:   3,
    accentColor: 'var(--probex-chart-secondary)',
    isFeatured:  true,
    exampleMarkets: [
      'BTC ETF inflows exceed $5B this quarter',
      'BlackRock IBIT surpasses $100B AUM by year-end',
      'Net BTC ETF flows positive for 10 consecutive weeks',
    ],
  },

  'on-chain-metrics': {
    id:          'on-chain-metrics',
    label:       'On-Chain',
    shortLabel:  'On-Chain',
    description: 'Network-derived signal markets — MVRV, SOPR, NVT, exchange flows',
    icon:        'Link',
    sortOrder:   4,
    accentColor: 'var(--probex-chart-tertiary)',
    isFeatured:  false,
    exampleMarkets: [
      'BTC MVRV ratio exceeds 3.5 before year-end',
      'BTC exchange reserve falls below 2M coins',
      'SOPR 30-day average above 1.05 in Q3',
      'Whale wallets (1000+ BTC) net accumulation this month',
    ],
  },

  'network-health': {
    id:          'network-health',
    label:       'Network Health',
    shortLabel:  'Network',
    description: 'Hashrate, difficulty adjustments, mining profitability, node count',
    icon:        'Cpu',
    sortOrder:   5,
    accentColor: 'var(--probex-positive)',
    isFeatured:  false,
    exampleMarkets: [
      'BTC hashrate reaches 1 ZH/s (zettahash) by Dec 2026',
      'BTC mining difficulty sets new ATH this quarter',
      'BTC mempool clears within 1 hour after halving',
    ],
  },

  'institutional-activity': {
    id:          'institutional-activity',
    label:       'Institutional',
    shortLabel:  'Inst.',
    description: 'Large-holder accumulation, corporate treasury, sovereign adoption',
    icon:        'Building2',
    sortOrder:   6,
    accentColor: 'var(--probex-secondary)',
    isFeatured:  true,
    exampleMarkets: [
      'MicroStrategy holds > 500,000 BTC by Q4',
      'A G7 government adds BTC to strategic reserve in 2026',
      'BTC institutional accumulation score remains positive this month',
      'Corporate BTC treasury adoption exceeds 100 public companies',
    ],
  },

  'macro-signals': {
    id:          'macro-signals',
    label:       'Macro Signals',
    shortLabel:  'Macro',
    description: 'Fed policy, DXY correlation, inflation-driven BTC predictions',
    icon:        'Globe',
    sortOrder:   7,
    accentColor: 'var(--probex-warning)',
    isFeatured:  false,
    exampleMarkets: [
      'Fed cuts rates at least twice before year-end',
      'BTC/Gold ratio exceeds 30 by Dec 2026',
      'BTC correlation with S&P 500 drops below 0.3 this quarter',
      'BTC outperforms gold YTD by end of 2026',
    ],
  },

  'market-structure': {
    id:          'market-structure',
    label:       'Market Structure',
    shortLabel:  'Structure',
    description: 'Dominance, open interest, funding rates, liquidation thresholds',
    icon:        'BarChart3',
    sortOrder:   8,
    accentColor: 'var(--probex-primary)',
    isFeatured:  false,
    exampleMarkets: [
      'BTC dominance exceeds 65% by end of Q3',
      'BTC perp funding rate stays positive for 30 consecutive days',
      'BTC open interest on CME surpasses $20B',
      'BTC spot volume exceeds derivatives volume this month',
    ],
  },
} as const satisfies Record<BitcoinSegment, SegmentDisplayConfig>

// ─── Sorted segment list ──────────────────────────────────────────────────

export const ORDERED_SEGMENTS: SegmentDisplayConfig[] = Object.values(
  MARKET_SEGMENTS,
).sort((a, b) => a.sortOrder - b.sortOrder)

/** Segments shown on the home dashboard hero section */
export const FEATURED_SEGMENTS: SegmentDisplayConfig[] = ORDERED_SEGMENTS.filter(
  (s) => s.isFeatured,
)

// ─── Segment lookup helpers ───────────────────────────────────────────────

export function getSegmentMeta(id: BitcoinSegment): SegmentDisplayConfig {
  return MARKET_SEGMENTS[id]
}

export function isValidSegment(id: string): id is BitcoinSegment {
  return id in MARKET_SEGMENTS
}
