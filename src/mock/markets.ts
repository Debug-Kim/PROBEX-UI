/**
 * Bitcoin Market Mock Data
 * ─────────────────────────
 * All 40 mock markets cover the 8 Bitcoin segments.
 * Data is deterministic — same values every render.
 * Time-based drift functions simulate live feel without randomness.
 *
 * Replace by swapping the service implementation in lib/api/marketService.ts.
 */

import type { Market, MarketStatus, SentimentBias, BitcoinSegment } from '@/types/market'
import { asMarketId } from '@/types/branded'

// ─── Factory helper ────────────────────────────────────────────────────────

function market(
  id: string,
  segment: BitcoinSegment,
  title: string,
  description: string,
  probability: number,
  volume24h: number,
  liquidity: number,
  sentiment: SentimentBias,
  closesAt: string,
  status: MarketStatus = 'live',
  tags: string[] = [],
): Market {
  const yesPrice = Math.round(probability * 100)
  return {
    id:                 asMarketId(id),
    assetClass:         'bitcoin',
    segment,
    title,
    question:           title,               // alias: prediction market display name
    description,
    probability,
    yesPrice,
    noPrice:            100 - yesPrice,
    volume:             volume24h,           // alias: primary display volume
    volume24h,
    volumeTotal:        volume24h * (14 + (yesPrice % 7)),
    liquidity,
    openInterest:       liquidity * 0.6,
    status,
    sentiment,
 resolutionDate: closesAt, // alias for backward compatibility
    closesAt,
    resolvedAt:         null,
    resolutionCriteria: `This market resolves YES if ${title.toLowerCase()}.`,
    tags,
    createdAt:          '2026-01-15T00:00:00Z',
    updatedAt:          new Date().toISOString(),
  }
}

// ─── Mock market data ──────────────────────────────────────────────────────

export const MOCK_MARKETS: Market[] = [

  // ── Price Targets ───────────────────────────────────────────────────────
  market(
    'btc-150k-dec-2026', 'price-targets',
    'BTC > $150,000 by Dec 31, 2026',
    'Will Bitcoin close above $150,000 USD on any exchange by December 31, 2026?',
    0.67, 1_840_000, 4_200_000, 'bullish', '2026-12-31T23:59:59Z',
    'live', ['price-target', 'annual', 'bitcoin'],
  ),
  market(
    'btc-180k-q4-2026', 'price-targets',
    'BTC closes Q4 2026 above $180,000',
    'Will Bitcoin close above $180,000 on December 31, 2026?',
    0.41, 920_000, 2_100_000, 'neutral', '2026-12-31T23:59:59Z',
    'live', ['price-target', 'q4'],
  ),
  market(
    'btc-100k-jun-2026', 'price-targets',
    'BTC > $100,000 by end of June 2026',
    'Will Bitcoin trade above $100,000 at any point before June 30, 2026?',
    0.78, 3_100_000, 6_800_000, 'bullish', '2026-06-30T23:59:59Z',
    'live', ['price-target', 'near-term'],
  ),
  market(
    'btc-120k-ath', 'price-targets',
    'BTC reaches new ATH above $120,000',
    'Will Bitcoin set a new all-time high above $120,000?',
    0.81, 2_400_000, 5_100_000, 'bullish', '2026-09-30T23:59:59Z',
    'live', ['ath', 'milestone'],
  ),
  market(
    'btc-200k-2026', 'price-targets',
    'BTC > $200,000 at any point in 2026',
    'Will Bitcoin trade above $200,000 at any point during calendar year 2026?',
    0.29, 640_000, 1_400_000, 'bearish', '2026-12-31T23:59:59Z',
    'live', ['moonshot', 'annual'],
  ),

  // ── Volatility ─────────────────────────────────────────────────────────
  market(
    'btc-vol-80-q3', 'volatility',
    'BTC 30-day realized vol exceeds 80% in Q3 2026',
    'Will Bitcoin 30-day realized volatility exceed 80% at any point in Q3 2026?',
    0.34, 380_000, 820_000, 'neutral', '2026-09-30T23:59:59Z',
    'live', ['volatility', 'q3'],
  ),
  market(
    'btc-20pct-drawdown', 'volatility',
    'BTC experiences a 20%+ drawdown from ATH in 2026',
    'Will Bitcoin experience a peak-to-trough decline of 20% or more during 2026?',
    0.55, 720_000, 1_600_000, 'neutral', '2026-12-31T23:59:59Z',
    'live', ['drawdown', 'risk'],
  ),
  market(
    'btc-vol-index-70', 'volatility',
    'BTC implied vol index above 70 this month',
    'Will the Bitcoin implied volatility index (BVIV) exceed 70 this calendar month?',
    0.42, 290_000, 680_000, 'neutral', '2026-06-30T23:59:59Z',
    'live', ['iv', 'monthly'],
  ),

  // ── ETF Flows ──────────────────────────────────────────────────────────
  market(
    'btc-etf-5b-q2', 'etf-flows',
    'BTC ETF inflows exceed $5B this quarter',
    'Will aggregate Bitcoin ETF net inflows exceed $5 billion in Q2 2026?',
    0.72, 1_100_000, 2_400_000, 'bullish', '2026-06-30T23:59:59Z',
    'live', ['etf', 'institutional', 'q2'],
  ),
  market(
    'ibit-100b-aum', 'etf-flows',
    'BlackRock IBIT surpasses $100B AUM by year-end',
    'Will BlackRock\'s IBIT Bitcoin ETF exceed $100 billion in assets under management by Dec 31, 2026?',
    0.61, 880_000, 1_900_000, 'bullish', '2026-12-31T23:59:59Z',
    'live', ['etf', 'blackrock', 'ibit'],
  ),
  market(
    'btc-etf-positive-10wk', 'etf-flows',
    'Net BTC ETF flows positive for 10 consecutive weeks',
    'Will Bitcoin ETF products sustain 10 consecutive weeks of net positive inflows?',
    0.58, 640_000, 1_300_000, 'bullish', '2026-09-30T23:59:59Z',
    'live', ['etf', 'flows', 'streak'],
  ),

  // ── On-Chain Metrics ───────────────────────────────────────────────────
  market(
    'btc-mvrv-3-5', 'on-chain-metrics',
    'BTC MVRV ratio exceeds 3.5 before year-end',
    'Will Bitcoin\'s MVRV (Market Value to Realized Value) ratio exceed 3.5 at any point before Dec 31, 2026?',
    0.48, 420_000, 940_000, 'neutral', '2026-12-31T23:59:59Z',
    'live', ['mvrv', 'on-chain'],
  ),
  market(
    'btc-exchange-reserve', 'on-chain-metrics',
    'BTC exchange reserve falls below 2M coins',
    'Will the total Bitcoin balance held on all exchanges fall below 2 million coins?',
    0.64, 550_000, 1_200_000, 'bullish', '2026-12-31T23:59:59Z',
    'live', ['exchange-flows', 'supply', 'on-chain'],
  ),
  market(
    'btc-whale-accumulation', 'on-chain-metrics',
    'Whale wallets net accumulation positive this month',
    'Will wallets holding 1,000+ BTC show net positive accumulation (buys > sells) this calendar month?',
    0.71, 480_000, 1_050_000, 'bullish', '2026-06-30T23:59:59Z',
    'live', ['whale', 'accumulation', 'monthly'],
  ),
  market(
    'btc-sopr-above-1', 'on-chain-metrics',
    'SOPR 30-day avg above 1.05 in Q3',
    'Will Bitcoin\'s 30-day average Spent Output Profit Ratio exceed 1.05 in Q3 2026?',
    0.53, 310_000, 720_000, 'neutral', '2026-09-30T23:59:59Z',
    'live', ['sopr', 'on-chain', 'q3'],
  ),

  // ── Network Health ─────────────────────────────────────────────────────
  market(
    'btc-hashrate-1zh', 'network-health',
    'BTC hashrate reaches 1 ZH/s by Dec 2026',
    'Will the Bitcoin network hashrate reach 1 zettahash per second (1 ZH/s) before December 31, 2026?',
    0.39, 280_000, 620_000, 'neutral', '2026-12-31T23:59:59Z',
    'live', ['hashrate', 'mining'],
  ),
  market(
    'btc-difficulty-ath', 'network-health',
    'BTC mining difficulty sets new ATH this quarter',
    'Will Bitcoin mining difficulty reach a new all-time high in Q2 2026?',
    0.76, 340_000, 780_000, 'bullish', '2026-06-30T23:59:59Z',
    'live', ['difficulty', 'mining', 'q2'],
  ),
  market(
    'btc-nodes-20k', 'network-health',
    'Bitcoin reachable nodes exceed 20,000',
    'Will the number of reachable Bitcoin full nodes exceed 20,000 at any point in 2026?',
    0.44, 190_000, 440_000, 'neutral', '2026-12-31T23:59:59Z',
    'live', ['nodes', 'decentralization'],
  ),

  // ── Institutional Activity ─────────────────────────────────────────────
  market(
    'microstrategy-500k-btc', 'institutional-activity',
    'MicroStrategy holds > 500,000 BTC by Q4 2026',
    'Will MicroStrategy (Strategy) disclose holdings of more than 500,000 BTC by Q4 2026?',
    0.62, 760_000, 1_700_000, 'bullish', '2026-12-31T23:59:59Z',
    'live', ['microstrategy', 'institutional', 'corporate'],
  ),
  market(
    'g7-btc-reserve', 'institutional-activity',
    'A G7 government adds BTC to strategic reserve in 2026',
    'Will a G7 nation (US, UK, Germany, France, Italy, Canada, Japan) officially add Bitcoin to its strategic reserve in 2026?',
    0.28, 480_000, 1_100_000, 'neutral', '2026-12-31T23:59:59Z',
    'live', ['government', 'reserve', 'g7'],
  ),
  market(
    'corp-btc-100-companies', 'institutional-activity',
    'Corporate BTC treasury adoption exceeds 100 public companies',
    'Will more than 100 publicly listed companies hold Bitcoin as a treasury asset by year-end 2026?',
    0.54, 390_000, 880_000, 'bullish', '2026-12-31T23:59:59Z',
    'live', ['corporate', 'treasury', 'adoption'],
  ),
  market(
    'btc-inst-score-positive', 'institutional-activity',
    'BTC institutional accumulation score remains positive this month',
    'Will the Probex Institutional Accumulation Score for Bitcoin remain net positive (>0.5) for the entire calendar month?',
    0.69, 520_000, 1_150_000, 'bullish', '2026-06-30T23:59:59Z',
    'live', ['institutional', 'accumulation', 'monthly'],
  ),

  // ── Macro Signals ──────────────────────────────────────────────────────
  market(
    'fed-cut-twice-2026', 'macro-signals',
    'Fed cuts rates at least twice before year-end 2026',
    'Will the US Federal Reserve cut the federal funds rate at least twice (2+ cuts) before December 31, 2026?',
    0.57, 690_000, 1_550_000, 'bullish', '2026-12-31T23:59:59Z',
    'live', ['fed', 'rates', 'macro'],
  ),
  market(
    'btc-gold-ratio-30', 'macro-signals',
    'BTC/Gold ratio exceeds 30 by Dec 2026',
    'Will the Bitcoin-to-Gold ratio (BTC price ÷ gold price per oz) exceed 30 by December 31, 2026?',
    0.49, 410_000, 920_000, 'neutral', '2026-12-31T23:59:59Z',
    'live', ['gold', 'macro', 'ratio'],
  ),
  market(
    'btc-sp500-correlation', 'macro-signals',
    'BTC correlation with S&P 500 drops below 0.3 in Q3',
    'Will the 90-day rolling correlation between Bitcoin and the S&P 500 fall below 0.3 at any point in Q3 2026?',
    0.38, 320_000, 730_000, 'neutral', '2026-09-30T23:59:59Z',
    'live', ['correlation', 'equity', 'macro'],
  ),
  market(
    'btc-outperforms-gold-ytd', 'macro-signals',
    'BTC outperforms gold YTD by end of 2026',
    'Will Bitcoin\'s year-to-date return exceed gold\'s year-to-date return as of December 31, 2026?',
    0.73, 560_000, 1_250_000, 'bullish', '2026-12-31T23:59:59Z',
    'live', ['gold', 'ytd', 'performance'],
  ),

  // ── Market Structure ───────────────────────────────────────────────────
  market(
    'btc-dominance-65', 'market-structure',
    'BTC dominance exceeds 65% by end of Q3 2026',
    'Will Bitcoin\'s market cap dominance (BTC.D) exceed 65% at any point before September 30, 2026?',
    0.58, 870_000, 1_950_000, 'bullish', '2026-09-30T23:59:59Z',
    'live', ['dominance', 'market-structure'],
  ),
  market(
    'btc-funding-positive-30d', 'market-structure',
    'BTC perp funding rate positive for 30 consecutive days',
    'Will Bitcoin perpetual futures funding rates remain continuously positive for 30 consecutive days?',
    0.46, 430_000, 960_000, 'neutral', '2026-09-30T23:59:59Z',
    'live', ['funding-rate', 'derivatives'],
  ),
  market(
    'btc-oi-cme-20b', 'market-structure',
    'BTC open interest on CME surpasses $20B',
    'Will Bitcoin open interest on the CME futures exchange exceed $20 billion?',
    0.52, 580_000, 1_300_000, 'bullish', '2026-12-31T23:59:59Z',
    'live', ['cme', 'open-interest', 'institutional'],
  ),
  market(
    'btc-spot-vs-deriv', 'market-structure',
    'BTC spot volume exceeds derivatives volume this month',
    'Will Bitcoin spot trading volume exceed total derivatives volume in June 2026?',
    0.31, 270_000, 610_000, 'bearish', '2026-06-30T23:59:59Z',
    'live', ['spot', 'derivatives', 'volume'],
  ),
]

// ─── Market lookup helpers ─────────────────────────────────────────────────

export function getMarketById(id: string): Market | undefined {
  return MOCK_MARKETS.find((m) => m.id === id)
}

export function getMarketsBySegment(segment: BitcoinSegment): Market[] {
  return MOCK_MARKETS.filter((m) => m.segment === segment)
}

export function getFeaturedMarkets(limit = 6): Market[] {
  // Featured: highest liquidity markets
  return [...MOCK_MARKETS]
    .sort((a, b) => b.liquidity - a.liquidity)
    .slice(0, limit)
}

export function getTrendingMarkets(limit = 8): Market[] {
  // Trending: highest 24h volume
  return [...MOCK_MARKETS]
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, limit)
}

/**
 * Simulate a live probability drift for the dashboard ticker.
 * Deterministic based on market ID hash — same drift per market per second.
 */
export function getLiveProbability(market: Market): number {
  const now     = Math.floor(Date.now() / 5000) // 5s ticks
  const idHash  = market.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const drift   = Math.sin((now + idHash) / 10) * 0.02
  return Math.max(0.01, Math.min(0.99, market.probability + drift))
}
