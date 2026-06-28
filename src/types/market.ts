import type { MarketId } from './branded'

// ─── Asset classes ────────────────────────────────────────────────────────
// MVP: only 'bitcoin' active. Others are future-ready.

export const ASSET_CLASSES = [
  'bitcoin',
  'ethereum', // future
  'solana',   // future
  'gold',     // future
  'indices',  // future
  'commodities', // future
] as const

export type AssetClass = (typeof ASSET_CLASSES)[number]

export const MVP_ASSET_CLASS: AssetClass = 'bitcoin'

// ─── Bitcoin market segments ──────────────────────────────────────────────
// Replaces generic "crypto / sports / politics" categories.

export const BITCOIN_SEGMENTS = [
  'price-targets',
  'volatility',
  'etf-flows',
  'on-chain-metrics',
  'network-health',
  'institutional-activity',
  'macro-signals',
  'market-structure',
] as const

export type BitcoinSegment = (typeof BITCOIN_SEGMENTS)[number]

export interface SegmentMeta {
  readonly id:          BitcoinSegment
  readonly label:       string
  readonly description: string
  readonly icon:        string  // Lucide icon name
  readonly sortOrder:   number
}

export const SEGMENT_META: Record<BitcoinSegment, SegmentMeta> = {
  'price-targets': {
    id:          'price-targets',
    label:       'Price Targets',
    description: 'BTC price level predictions',
    icon:        'TrendingUp',
    sortOrder:   1,
  },
  'volatility': {
    id:          'volatility',
    label:       'Volatility',
    description: 'Implied and realized volatility markets',
    icon:        'Activity',
    sortOrder:   2,
  },
  'etf-flows': {
    id:          'etf-flows',
    label:       'ETF Flows',
    description: 'Bitcoin ETF inflow / outflow predictions',
    icon:        'ArrowLeftRight',
    sortOrder:   3,
  },
  'on-chain-metrics': {
    id:          'on-chain-metrics',
    label:       'On-Chain',
    description: 'Network-derived signal markets',
    icon:        'Link',
    sortOrder:   4,
  },
  'network-health': {
    id:          'network-health',
    label:       'Network Health',
    description: 'Hashrate, difficulty, node count',
    icon:        'Cpu',
    sortOrder:   5,
  },
  'institutional-activity': {
    id:          'institutional-activity',
    label:       'Institutional',
    description: 'Large-holder and institutional activity',
    icon:        'Building2',
    sortOrder:   6,
  },
  'macro-signals': {
    id:          'macro-signals',
    label:       'Macro Signals',
    description: 'Fed policy, DXY, macro-correlated BTC markets',
    icon:        'Globe',
    sortOrder:   7,
  },
  'market-structure': {
    id:          'market-structure',
    label:       'Market Structure',
    description: 'Dominance, funding rates, open interest',
    icon:        'BarChart3',
    sortOrder:   8,
  },
} as const satisfies Record<BitcoinSegment, SegmentMeta>

// ─── Market status ────────────────────────────────────────────────────────

export type MarketStatus = 'live' | 'paused' | 'settling' | 'resolved' | 'cancelled'

export type SentimentBias = 'bullish' | 'bearish' | 'neutral'

// ─── Market entity ────────────────────────────────────────────────────────

export interface Market {
  readonly id:         MarketId
  readonly assetClass: AssetClass
  readonly segment:    BitcoinSegment
  title:               string
  question:            string   // alias for title — prediction market display name
  description:         string
  probability:         number   // 0–1
  yesPrice:            number   // cents (0–100)
  noPrice:             number   // cents (0–100), always 100 - yesPrice
  volume:              number   // USD 24h volume (primary display metric)
  volume24h:           number   // USD
  volumeTotal:         number   // USD
  liquidity:           number   // USD
  openInterest:        number   // USD
  status:              MarketStatus
  sentiment:           SentimentBias
  resolutionDate:      string   // ISO 8601 — alias for closesAt
  closesAt:            string   // ISO 8601
  resolvedAt:          string | null
  resolutionCriteria:  string
  tags:                string[]
  createdAt:           string
  updatedAt:           string
}

// ─── Price history ────────────────────────────────────────────────────────

export interface PricePoint {
  timestamp: number  // Unix ms
  probability: number
  volume:      number
}

export type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d' | 'all'

// ─── Order book ───────────────────────────────────────────────────────────

export interface OrderBookLevel {
  price:    number  // cents
  quantity: number  // contracts
}

export interface OrderBook {
  marketId: MarketId
  yes:      OrderBookLevel[]
  no:       OrderBookLevel[]
  spread:   number
  updatedAt: string
}

// ─── Market update (live) ─────────────────────────────────────────────────

export interface MarketUpdate {
  marketId:    MarketId
  probability: number
  yesPrice:    number
  noPrice:     number
  volume24h:   number
  liquidity:   number
  updatedAt:   string
}

// ─── Pagination ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data:       T[]
  total:      number
  cursor:     string | null  // null = end of results
  hasMore:    boolean
}

// ─── Filters ─────────────────────────────────────────────────────────────

export interface MarketFilters {
  assetClass?: AssetClass | undefined
  segment?:    BitcoinSegment | undefined
  status?:     MarketStatus | undefined
  search?:     string | undefined
  sortBy?:     MarketSortField | undefined
  sortDir?:    'asc' | 'desc' | undefined
  cursor?:     string | undefined
  limit?:      number | undefined
}

export type MarketSortField =
  | 'probability'
  | 'consensus'
  | 'volume24h'
  | 'liquidity'
  | 'openInterest'
  | 'closesAt'
  | 'hot'   // composite: volume + probability change velocity
