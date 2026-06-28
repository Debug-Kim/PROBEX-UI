/**
 * Market Detail Mock Data
 * ────────────────────────
 * Extended research content and key drivers for market detail pages.
 * replace with IMarketService.getMarketDetail API call.
 */

import type { MarketId } from '@/types/branded'

// ─── Types ────────────────────────────────────────────────────────────────

export interface KeyDriver {
  label:       string
  description: string
  direction:   'bullish' | 'bearish' | 'neutral'
  weight:      'high' | 'medium' | 'low'
}

export interface MarketResearch {
  readonly marketId:     MarketId
  summary:               string
  keyDrivers:            KeyDriver[]
  supportingSignals:     string[]
  risks:                 string[]
  analystNotes:          string
  lastUpdated:           string
  analystHandle:         string
}

export interface RelatedMarket {
  id:          string
  title:       string
  probability: number
  consensus:   number
  correlation: 'positive' | 'negative' | 'neutral'
}

// ─── Research data factory ────────────────────────────────────────────────

function research(
  marketId: string,
  summary: string,
  keyDrivers: KeyDriver[],
  supportingSignals: string[],
  risks: string[],
  analystNotes: string,
  analystHandle = 'probex-research',
): MarketResearch {
  return {
    marketId: marketId as MarketId,
    summary,
    keyDrivers,
    supportingSignals,
    risks,
    analystNotes,
    lastUpdated:   new Date(Date.now() - 3_600_000 * 4).toISOString(),
    analystHandle,
  }
}

// ─── Research by market ID ────────────────────────────────────────────────

export const MOCK_RESEARCH: Record<string, MarketResearch> = {

  'btc-150k-dec-2026': research(
    'btc-150k-dec-2026',
    'Bitcoin has demonstrated strong bullish momentum following the 2024 halving cycle. The combination of institutional ETF inflows, reduced sell pressure from miners, and the macro tailwind of anticipated Fed rate cuts creates a favourable environment for continued appreciation through 2026.',
    [
      { label: 'Halving Supply Shock',         description: 'Post-halving supply reduction historically precedes 12–18 month bull cycles. Miner revenues compress, reducing sell pressure on exchanges.', direction: 'bullish', weight: 'high' },
      { label: 'ETF Institutional Inflows',    description: 'BlackRock IBIT and competing products continue to attract institutional capital at a pace that significantly outstrips new supply.', direction: 'bullish', weight: 'high' },
      { label: 'Fed Rate Environment',         description: 'Anticipated 2026 rate cuts reduce the opportunity cost of holding non-yielding assets like Bitcoin, supporting risk appetite.', direction: 'bullish', weight: 'medium' },
      { label: 'Exchange Reserve Depletion',   description: 'On-chain data shows exchange BTC reserves near multi-year lows, reducing available sell-side liquidity.', direction: 'bullish', weight: 'medium' },
      { label: 'Regulatory Clarity Risk',      description: 'Any adverse regulatory development in major markets (US, EU) could dampen institutional appetite.', direction: 'bearish', weight: 'low' },
    ],
    [
      'Whale wallets (1000+ BTC) have been in net accumulation mode for 11 consecutive weeks',
      'Spot BTC ETF AUM crossed $80B in aggregate as of early June 2026',
      'Bitcoin dominance above 58%, indicating crypto capital rotation into BTC',
      'Miner capitulation event resolved — hash ribbons signal is green',
      'MVRV ratio at 2.4, historically mid-cycle — room to run before overheating',
    ],
    [
      'A sustained US recession could trigger broad risk-asset sell-offs including Bitcoin',
      'Black swan regulatory event (e.g. surprise SEC enforcement action against ETF custodians)',
      'Mining cartel attack or 51% attack scenario (very low probability)',
      'Tether USDT depegging event causing crypto market liquidity crisis',
      'Major exchange hack or insolvency (FTX-type event)',
    ],
    'The Probex Consensus Engine is showing 91% agreement across institutional and retail signal sources, with institutional bias strongly bullish. The primary risk to this thesis is macro-driven risk-off sentiment, which historically causes temporary Bitcoin drawdowns of 20–35% even in bull market conditions. Given the strong ETF demand floor, we believe significant dips would be bought aggressively.',
    'probex-alpha-desk',
  ),

  'btc-etf-5b-q2': research(
    'btc-etf-5b-q2',
    'Bitcoin ETF products launched in January 2024 continue to see exceptional capital inflows. Q2 2026 inflows have tracked ahead of Q1 2026 pace. The primary driver is ongoing institutional allocation to Bitcoin as a portfolio diversifier and inflation hedge.',
    [
      { label: 'Pension Fund Allocation',       description: 'Several state pension funds have disclosed Bitcoin ETF positions in Q1 2026 13-F filings, with more expected to follow.', direction: 'bullish', weight: 'high' },
      { label: 'BlackRock IBIT Growth',         description: 'IBIT alone accounts for ~45% of aggregate ETF inflows. BlackRock marketing efforts targeting wealth management platforms continue.', direction: 'bullish', weight: 'high' },
      { label: 'Seasonal Pattern',              description: 'Q2 historically shows strong ETF inflows as institutional portfolio reviews and rebalancing windows open.', direction: 'bullish', weight: 'medium' },
      { label: 'Price Appreciation Dampener',   description: 'If BTC price appreciation is muted in Q2, performance-chasing capital may pause allocations.', direction: 'bearish', weight: 'low' },
    ],
    [
      'Q1 2026 net ETF inflows were $4.2B across all spot Bitcoin ETF products',
      'Daily inflow run-rate for June 2026 is tracking ~$75M/day, implying ~$6.9B quarterly pace',
      'New ETF launch in European markets expected to broaden institutional access',
    ],
    [
      'Outflow spike if BTC price falls below key psychological levels ($80K)',
      'Regulatory review of ETF custodian arrangements could cause brief pause',
    ],
    'Q2 2026 is tracking well ahead of the $5B threshold. Barring a significant BTC price correction, this market resolves YES with high probability.',
  ),

  'btc-dominance-65': research(
    'btc-dominance-65',
    'Bitcoin dominance has been trending upward as capital consolidates into the most liquid and institutionally-endorsed crypto asset. Altcoin market performance has been tepid, with capital rotating from speculative tokens back to Bitcoin.',
    [
      { label: 'Altcoin Underperformance',   description: 'Most altcoins have underperformed Bitcoin YTD, driving dominance higher as investors rotate to quality.', direction: 'bullish', weight: 'high' },
      { label: 'Institutional Bitcoin Focus', description: 'ETF products only exist for Bitcoin (and Ethereum), concentrating institutional capital allocation.', direction: 'bullish', weight: 'high' },
      { label: 'Altcoin Season Catalyst',    description: 'A strong altcoin season driven by DeFi or NFT revival could reverse dominance trend.', direction: 'bearish', weight: 'medium' },
    ],
    [
      'BTC dominance currently at 58.4%, with upward trend intact',
      'Ethereum dominance has remained flat at ~12% as ETH/BTC ratio weakens',
      'Stablecoin market cap growth absorbs some capital that would otherwise flow to alts',
    ],
    [
      'Strong ETH ETF inflows could pull capital away from Bitcoin',
      'Layer 2 ecosystem growth creating compelling alt investment narratives',
    ],
    'Dominance reaching 65% would represent the highest level since 2021. The trend is constructive but needs further altcoin underperformance to reach the threshold.',
  ),
}

// ─── Related markets helper ───────────────────────────────────────────────

export const MOCK_RELATED: Record<string, RelatedMarket[]> = {
  'btc-150k-dec-2026': [
    { id: 'btc-120k-ath',           title: 'BTC reaches new ATH above $120K',   probability: 0.81, consensus: 0.86, correlation: 'positive' },
    { id: 'btc-100k-jun-2026',      title: 'BTC > $100K by end of June 2026',   probability: 0.78, consensus: 0.88, correlation: 'positive' },
    { id: 'btc-180k-q4-2026',       title: 'BTC closes Q4 2026 above $180K',    probability: 0.41, consensus: 0.68, correlation: 'positive' },
    { id: 'btc-inst-score-positive',title: 'Institutional accumulation positive', probability: 0.69, consensus: 0.85, correlation: 'positive' },
  ],
  'btc-etf-5b-q2': [
    { id: 'ibit-100b-aum',          title: 'IBIT surpasses $100B AUM',           probability: 0.61, consensus: 0.76, correlation: 'positive' },
    { id: 'btc-etf-positive-10wk',  title: 'Net ETF flows positive 10 weeks',   probability: 0.58, consensus: 0.72, correlation: 'positive' },
    { id: 'btc-150k-dec-2026',      title: 'BTC > $150K by Dec 2026',            probability: 0.67, consensus: 0.91, correlation: 'positive' },
  ],
}

export function getResearch(marketId: string): MarketResearch | undefined {
  // Return market-specific research if available, otherwise generate generic
  if (MOCK_RESEARCH[marketId]) return MOCK_RESEARCH[marketId]

  // Generic fallback for markets without specific research
  return research(
    marketId,
    'This Bitcoin prediction market is driven by a combination of on-chain metrics, institutional flow data, and macroeconomic signals processed by the Probex Consensus Engine.',
    [
      { label: 'On-Chain Signal',        description: 'Network activity and holder behavior support the current probability assessment.', direction: 'bullish', weight: 'high'   },
      { label: 'Institutional Activity', description: 'Institutional flow data provides a constructive backdrop.', direction: 'bullish', weight: 'medium' },
      { label: 'Macro Environment',      description: 'Broader macro conditions are a secondary but material factor.', direction: 'neutral', weight: 'low'    },
    ],
    [
      'Consensus Engine signal strength rated ' + (Math.random() > 0.5 ? 'Strong' : 'Moderate'),
      'Historical resolution rate for similar markets: 68%',
      'Market liquidity depth supports reliable price discovery',
    ],
    [
      'Unexpected macro shock could materially shift probability',
      'Low liquidity could amplify price moves near resolution',
    ],
    'Probex Consensus Engine shows moderate agreement across signal sources. Standard risk considerations apply.',
  )
}

export function getRelatedMarkets(marketId: string): RelatedMarket[] {
  return MOCK_RELATED[marketId] ?? []
}
