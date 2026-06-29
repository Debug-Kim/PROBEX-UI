// Six fully-typed Bitcoin intelligence reports spanning every ResearchCategoryId.
// Replace with IResearchService.getReports backed by a CMS or DB.

import type {
  ResearchReport,
  ResearchAuthor,
  ResearchCategory,
  ResearchCategoryId,
  ETFReport,
  MacroReport,
  ConsensusReport,
} from '@/types/research'
import { asReportId } from '@/types/branded'

// ─── Authors ──────────────────────────────────────────────────────────────

export const RESEARCH_AUTHORS: Record<string, ResearchAuthor> = {
  alphaDeskHead: {
    id:          'author-001',
    handle:      '@probex-alpha-desk',
    name:        'Probex Alpha Desk',
    type:        'analyst',
    avatarLabel: 'PA',
  },
  quantModel: {
    id:          'author-002',
    handle:      '@probex-quant',
    name:        'QUBO Quantitative Model',
    type:        'quant-model',
    avatarLabel: '⚙',
  },
  consensusEngine: {
    id:          'author-003',
    handle:      '@probex-engine',
    name:        'QUBO Consensus Engine',
    type:        'consensus-engine',
    avatarLabel: '⚡',
  },
  macroDesk: {
    id:          'author-004',
    handle:      '@probex-macro',
    name:        'Probex Macro Research',
    type:        'analyst',
    avatarLabel: 'MR',
  },
}

// ─── Categories Registry ───────────────────────────────────────────────────

export const RESEARCH_CATEGORIES: ResearchCategory[] = [
  {
    id:          'btc-outlook',
    label:       'BTC Outlook',
    description: 'Directional price targets and market cycle analysis for Bitcoin.',
    iconLabel:   '₿',
  },
  {
    id:          'consensus-report',
    label:       'Consensus Reports',
    description: 'Probex Consensus Engine performance, accuracy, and signal analysis.',
    iconLabel:   '⚡',
  },
  {
    id:          'etf-monitor',
    label:       'ETF Monitor',
    description: 'Bitcoin ETF inflow/outflow tracking and AUM analysis.',
    iconLabel:   '📊',
  },
  {
    id:          'institutional-activity',
    label:       'Institutional Activity',
    description: 'Corporate treasury adoption, whale flows, and smart money positioning.',
    iconLabel:   '🏛',
  },
  {
    id:          'macro-signals',
    label:       'Macro Signals',
    description: 'Fed policy, DXY correlation, liquidity conditions, and rate sensitivity.',
    iconLabel:   '🌐',
  },
  {
    id:          'market-structure',
    label:       'Market Structure',
    description: 'BTC dominance, derivatives markets, open interest, and on-chain regime analysis.',
    iconLabel:   '📈',
  },
  {
    id:          'on-chain-signals',
    label:       'On-Chain Signals',
    description: 'MVRV, SOPR, exchange reserves, miner activity, and holder behaviour.',
    iconLabel:   '🔗',
  },
  {
    id:          'weekly-brief',
    label:       'Weekly Brief',
    description: 'Curated weekly summary of all active Probex consensus signals and market moves.',
    iconLabel:   '📋',
  },
]

// ─── Report 1: BTC Q3 Outlook ─────────────────────────────────────────────

const btcOutlookReport: ResearchReport = {
  id:              asReportId('report-001'),
  title:           'Bitcoin Q3 2026 Outlook: Institutional Absorption Meets Supply Shock',
  subtitle:        'Why the halving + ETF demand floor sets up a historic Q3',
  categoryId:      'btc-outlook',
  format:          'outlook',
  status:          'published',
  sentiment:       'strongly-bullish',
  confidence:      'high',
  relevantSegments: ['price-targets', 'institutional-activity', 'etf-flows'],
  estimatedReadMinutes: 12,

  thesis: {
    statement:        'Bitcoin will reach $150,000–$175,000 by Q3 2026 end, driven by ETF demand absorbing 4x the current daily supply issuance.',
    confidence:       'high',
    timeHorizon:      '90d',
    supportingFactors: [
      'Post-halving supply shock: only 450 BTC/day new issuance vs ~2,000 BTC/day ETF demand',
      'Institutional ETF AUM crossed $90B — pension funds beginning allocations',
      'Exchange BTC reserves at multi-year lows: ~2.1M BTC remaining on exchanges',
      'Probex Consensus Engine showing 91% bull signal on price-target markets',
      'Miner hash ribbons signal green — no further capitulation expected',
    ],
    risks: [
      'Surprise Fed hawkish pivot could trigger risk-off rotation',
      'Black swan exchange insolvency or custodial hack',
      'Regulatory action targeting ETF products',
      'China-Taiwan geopolitical escalation causing broad market sell-off',
    ],
  },

  summary: 'The halving-driven supply reduction combined with record ETF institutional demand creates an asymmetric setup for Q3 2026. With exchange reserves at cycle lows and the Probex Consensus Engine reading 91% bullish on price-target markets, the path of least resistance is higher. We target $150,000–$175,000 by September 30, 2026.',

  body: `## Executive Summary

The Bitcoin market in mid-2026 is defined by an unprecedented structural imbalance between supply and demand. The April 2024 halving cut new supply issuance to 450 BTC/day, while spot ETF products are now absorbing approximately 2,000 BTC/day in net inflows. This 4.4x demand-to-supply ratio is the primary driver of our bullish Q3 outlook.

## Supply Dynamics

Post-halving miner economics have stabilized. The Hash Ribbon indicator — which historically signals buy opportunities when miner capitulation ends — turned green in early June 2026. Miner sell pressure has normalized.

Exchange reserve data shows only approximately 2.1 million BTC remaining across all major exchanges, the lowest level since 2018. This illiquidity creates conditions for outsized price appreciation when new demand arrives.

## Demand Dynamics

The institutional adoption wave has materially changed Bitcoin's demand profile. BlackRock IBIT alone holds over $80B AUM and continues to see consistent net positive inflows. State pension funds in Wisconsin and Michigan have disclosed Bitcoin ETF positions, with more expected in Q3.

## Consensus Engine Reading

The Probex QUBO Consensus Engine is scoring institutional-grade Bitcoin prediction markets at an average of 78% bullish across all price-target segments. The Signal Strength for the $150K December 2026 market reads 91% — the highest reading in our dataset.

## Price Target Basis

Our $150,000–$175,000 Q3 target is derived from:
- Stock-to-Flow model extension: $168,000 mid-cycle target
- ETF demand absorption modeling: supply/demand equilibrium at $155,000+  
- On-chain MVRV trajectory: consistent with prior bull market peaks at 3.5x+

## Risk Scenarios

**Bull case ($200,000+):** Sovereign wealth fund Bitcoin purchases announced; more state pension disclosures; Fed cuts rates twice in Q3.

**Base case ($150,000–$175,000):** Current trajectory continues; ETF inflows moderate slightly; no macro shock.

**Bear case ($100,000–$120,000):** Fed remains hawkish; equity market correction triggers BTC correlation sell-off; ETF outflow spike.`,

  keyPoints: [
    'ETF products absorbing 4.4x daily new supply — unprecedented demand floor',
    'Exchange BTC reserves at cycle lows (~2.1M BTC), reducing sell-side liquidity',
    'Consensus Engine: 91% bullish on BTC $150K December market',
    'Miner capitulation over — hash ribbons signal green',
    'Target range: $150,000–$175,000 by September 30, 2026',
  ],

  signals: [
    {
      id:              'sig-001-a',
      type:            'bullish-flag',
      label:           'ETF Demand Floor',
      description:     'Daily ETF inflows at 4.4x new supply issuance — structural buy pressure unlikely to reverse near-term.',
      relevantMarkets: ['btc-150k-dec-2026', 'btc-120k-ath', 'btc-100k-jun-2026'],
      strength:        'strong',
      confidence:      'high',
    },
    {
      id:              'sig-001-b',
      type:            'bullish-flag',
      label:           'Exchange Reserve Depletion',
      description:     'Sub-2.1M BTC on exchanges creates supply-side illiquidity premium.',
      relevantMarkets: ['btc-exchange-reserve', 'btc-150k-dec-2026'],
      strength:        'strong',
      confidence:      'high',
    },
    {
      id:              'sig-001-c',
      type:            'watch',
      label:           'Macro Risk Monitor',
      description:     'Fed rate decision on July 30 is the primary macro risk event for Q3.',
      relevantMarkets: ['fed-cut-twice-2026', 'btc-sp500-correlation'],
      strength:        'moderate',
      confidence:      'medium',
    },
  ],

  sources: [
    { label: 'Glassnode Exchange Reserve Data',    type: 'on-chain' },
    { label: 'BlackRock IBIT 13-F Filing',         type: 'etf-data' },
    { label: 'Probex Consensus Engine v2',         type: 'consensus-engine' },
    { label: 'Bitcoin Stock-to-Flow Model (PlanB)', type: 'public' },
  ],

  author:          RESEARCH_AUTHORS.alphaDeskHead!,
  tags:            ['price-target', 'q3-2026', 'halving', 'etf', 'institutional'],
  publishedAt:     new Date(Date.now() - 3_600_000 * 48).toISOString(),
  updatedAt:       new Date(Date.now() - 3_600_000 * 2).toISOString(),
  consensusScoreAtPublication: 0.87,
  featuredMarkets: ['btc-150k-dec-2026', 'btc-120k-ath', 'btc-etf-5b-q2'],
}

// ─── Report 2: Consensus Engine June 2026 Performance Report ───────────────

const consensusReport: ConsensusReport = {
  id:              asReportId('report-002'),
  title:           'Consensus Engine Performance: June 2026',
  subtitle:        'Monthly accuracy audit — institutional signals outperform retail by 14pp',
  categoryId:      'consensus-report',
  format:          'signal-brief',
  status:          'published',
  sentiment:       'bullish',
  confidence:      'high',
  relevantSegments: ['price-targets', 'etf-flows', 'institutional-activity'],
  estimatedReadMinutes: 6,

  thesis: {
    statement:        'The Consensus Engine maintained 76% overall accuracy in June 2026, with institutional signals reaching 82% — validating the intelligence-first approach.',
    confidence:       'high',
    timeHorizon:      '30d',
    supportingFactors: [
      '76% overall consensus accuracy across 23 resolved markets in June',
      'Institutional signal accuracy: 82% vs retail 68%',
      'Strong-signal accuracy: 89% (only 11 weak-signal resolutions total)',
      'ETF-flows segment: 91% accuracy, highest of all segments',
    ],
    risks: [
      'Sample size (23 resolved markets) is statistically small for broad conclusions',
      'July has higher macro uncertainty than June — accuracy may compress',
    ],
  },

  summary: 'The QUBO Consensus Engine delivered 76% overall accuracy across 23 resolved Bitcoin prediction markets in June 2026. Institutional signals outperformed retail signals by 14 percentage points (82% vs 68%), and strong-signal markets resolved correctly at 89%.',

  body: `## June 2026 Performance Summary

The Probex QUBO Consensus Engine processed and scored 23 resolved markets in June 2026 with an overall accuracy rate of **76%**.

## Signal Breakdown

| Signal Strength | Accuracy | Markets Scored |
|----------------|----------|----------------|
| Strong         | 89%      | 9              |
| Moderate       | 74%      | 11             |
| Weak           | 43%      | 3              |

## Institutional vs Retail

The most significant finding of June's performance review is the divergence between institutional and retail signal accuracy. Institutional signals (those dominated by smart money flows, whale on-chain activity, and ETF positioning data) resolved correctly 82% of the time, compared to 68% for retail-dominated signals.

This 14 percentage point premium validates the Consensus Engine's weighted approach, which applies a 40% weight to institutional signals vs 20% to retail.

## Segment Performance

**Top segment:** ETF Flows — 91% accuracy. All four ETF-related markets that resolved in June produced outcomes matching our institutional consensus read.

**Weakest segment:** Macro Signals — 58% accuracy. The macro environment remains the most difficult domain for our signals, as Fed policy surprises create sharp dislocations from consensus expectations.`,

  keyPoints: [
    '76% overall accuracy across 23 resolved markets in June 2026',
    'Institutional signals: 82% accuracy | Retail signals: 68% accuracy',
    'Strong-signal markets: 89% accuracy — near-perfect prediction',
    'ETF Flows segment highest accuracy: 91%',
    'Macro Signals segment lowest accuracy: 58%',
  ],

  signals: [
    {
      id:              'sig-002-a',
      type:            'bullish-flag',
      label:           'High Strong-Signal Accuracy',
      description:     'Markets with strong consensus signals resolving at 89% — continue weighting these heavily.',
      relevantMarkets: ['btc-150k-dec-2026', 'btc-etf-5b-q2', 'btc-difficulty-ath'],
      strength:        'strong',
      confidence:      'high',
    },
  ],

  sources: [
    { label: 'Probex Consensus Engine Resolution Database', type: 'consensus-engine' },
    { label: 'Probex Market Settlement Records',           type: 'market-data' },
  ],

  engineMetrics: {
    avgScore:              0.76,
    signalStrength:        'strong',
    instRetailDivergence:  0.14,
    marketsCoverage:       23,
  },

  author:           RESEARCH_AUTHORS.consensusEngine!,
  tags:             ['consensus', 'accuracy', 'performance', 'june-2026'],
  publishedAt:      new Date(Date.now() - 3_600_000 * 24).toISOString(),
  updatedAt:        new Date(Date.now() - 3_600_000).toISOString(),
  consensusScoreAtPublication: 0.76,
  featuredMarkets:  ['btc-150k-dec-2026', 'btc-etf-5b-q2'],
}

// ─── Report 3: ETF Monitor Q2 2026 ────────────────────────────────────────

const etfReport: ETFReport = {
  id:              asReportId('report-003'),
  title:           'Bitcoin ETF Monitor: Q2 2026 Inflow Analysis',
  subtitle:        '$4.2B net inflows YTD — pace to exceed full-year 2025 by June',
  categoryId:      'etf-monitor',
  format:          'monitor',
  status:          'published',
  sentiment:       'bullish',
  confidence:      'high',
  relevantSegments: ['etf-flows', 'institutional-activity'],
  estimatedReadMinutes: 8,

  thesis: {
    statement:        'Q2 2026 Bitcoin ETF net inflows are on pace to reach $5B+ for the quarter, driven by IBIT expansion and new entrants from wealth management platforms.',
    confidence:       'high',
    timeHorizon:      '30d',
    supportingFactors: [
      'Q2 daily average inflow: $73M/day — up 22% from Q1 daily average',
      'IBIT AUM crossed $82B in May — now largest commodity ETF globally',
      'Two new ETF products launched by Fidelity and Franklin Templeton in Q2',
      'Vanguard reversed Bitcoin ETF ban — expected to offer to clients H2 2026',
    ],
    risks: [
      'BTC price correction could trigger outflow cycle (as seen in March 2024)',
      'New product launches could fragment inflows rather than add to total',
    ],
  },

  summary: 'Q2 2026 Bitcoin ETF products recorded $4.2B in net inflows YTD through June 15, tracking ahead of the $5B target in our prediction markets. IBIT leads with ~44% market share. Vanguard\'s reversal of its Bitcoin ETF ban is a major catalyst for H2 2026.',

  body: `## Q2 2026 ETF Flow Summary

Bitcoin spot ETF products have continued their extraordinary growth trajectory in Q2 2026. Through June 15, aggregate net inflows stand at $4.2B year-to-date, with Q2 specifically accounting for $2.1B of that total.

## Product Breakdown

**iShares Bitcoin Trust (IBIT):** Dominant market leader with $82B AUM and ~44% of all inflows. BlackRock's distribution network into wealth management platforms continues to drive steady daily inflows of $28–35M.

**Fidelity Wise Origin Bitcoin Fund (FBTC):** Second place with $23B AUM. Strong retail platform distribution through Fidelity's 25M customer base.

**Other Products:** The remaining 8 products share approximately 25% of market share, with ARK 21Shares (ARKB) and Bitwise (BITB) showing strongest relative growth.

## Demand Analysis

The composition of ETF buyers has shifted meaningfully in 2026. Q4 2025 13-F filings showed pension funds, endowments, and insurance companies now representing ~18% of ETF AUM — up from 6% at launch in January 2024. This institutionalization of demand is the most significant structural shift in Bitcoin's history.`,

  keyPoints: [
    '$4.2B net inflows YTD through June 15, 2026',
    'Q2 daily average: $73M/day (+22% vs Q1)',
    'IBIT AUM: $82B — now largest commodity ETF globally',
    'Pension/endowment share of ETF ownership: 18% (vs 6% at launch)',
    'Vanguard reversed Bitcoin ETF ban — H2 2026 catalyst',
  ],

  signals: [
    {
      id:              'sig-003-a',
      type:            'bullish-flag',
      label:           'Vanguard Reversal Catalyst',
      description:     'Vanguard\'s reversal creates a new distribution channel for 30M+ clients, potentially adding $500M–$2B in incremental demand.',
      relevantMarkets: ['btc-etf-5b-q2', 'ibit-100b-aum'],
      strength:        'strong',
      confidence:      'high',
    },
  ],

  etfMetrics: {
    weeklyNetInflow: 511,
    topProduct:      'IBIT (BlackRock)',
    topProductFlow:  225,
    cumulativeAum:   94_200,
    inflowStreak:    8,
  },

  sources: [
    { label: 'SEC 13-F Filings Q4 2025',     type: 'public' },
    { label: 'Bloomberg ETF Flow Data',       type: 'market-data' },
    { label: 'Farside Investors ETF Tracker', type: 'public' },
  ],

  author:           RESEARCH_AUTHORS.alphaDeskHead!,
  tags:             ['etf', 'ibit', 'inflows', 'q2-2026', 'institutional'],
  publishedAt:      new Date(Date.now() - 3_600_000 * 72).toISOString(),
  updatedAt:        new Date(Date.now() - 3_600_000 * 20).toISOString(),
  consensusScoreAtPublication: 0.84,
  featuredMarkets:  ['btc-etf-5b-q2', 'ibit-100b-aum', 'btc-etf-positive-10wk'],
}

// ─── Report 4: Institutional Activity ─────────────────────────────────────

const institutionalReport: ResearchReport = {
  id:              asReportId('report-004'),
  title:           'Corporate Bitcoin Treasury Wave: Q2 2026 Status Report',
  subtitle:        '94 public companies now hold BTC — MicroStrategy effect rippling through S&P 500',
  categoryId:      'institutional-activity',
  format:          'report',
  status:          'published',
  sentiment:       'bullish',
  confidence:      'medium',
  relevantSegments: ['institutional-activity', 'price-targets'],
  estimatedReadMinutes: 10,

  thesis: {
    statement:        'Corporate Bitcoin treasury adoption will cross 100 public companies by Q3 2026, validating the Probex market and creating a permanent demand floor.',
    confidence:       'medium',
    timeHorizon:      '90d',
    supportingFactors: [
      '94 public companies hold Bitcoin as treasury asset as of June 2026',
      'MicroStrategy (Strategy) holds 520,000 BTC — 2.5% of total supply',
      'New accounting rule FASB ASU 2023-08 makes fair-value reporting easier',
      'Board-level discussions of Bitcoin treasury at Fortune 500 companies accelerating',
    ],
    risks: [
      'Regulatory risk: SEC could reclassify corporate BTC holdings',
      'Accounting complexity still deters smaller companies',
      '100-company milestone is achievable but not certain by Q3 end',
    ],
  },

  summary: '94 public companies now hold Bitcoin as a treasury asset, up from 60 at the start of 2026. The FASB ASU 2023-08 fair-value accounting rule has lowered the barrier for adoption. Our Probex market predicting >100 companies by year-end is tracking ahead of pace.',

  body: `## Corporate Bitcoin Adoption: Current State

As of June 2026, **94 publicly-listed companies** globally hold Bitcoin as a balance sheet asset, according to Bitcoin Treasuries data. This represents 57% growth from 60 companies at the start of 2026.

## MicroStrategy Effect

MicroStrategy (now rebranded "Strategy") continues to lead with 520,000 BTC — approximately 2.5% of Bitcoin's maximum supply of 21M coins. The company's convertible note strategy for BTC accumulation has been replicated by at least 12 other public companies in 2026.

## FASB Accounting Change Impact

The FASB ASU 2023-08 accounting standard, effective for fiscal years beginning after December 15, 2024, allows companies to carry Bitcoin at fair value rather than lower-of-cost-or-market. This removes the asymmetric write-down accounting that deterred many CFOs. Since adoption began, the quarterly increase in new corporate Bitcoin holders has doubled.

## Key Holders (Q2 2026)
- Strategy (MicroStrategy): 520,000 BTC
- Block Inc: 8,500 BTC  
- Tesla: 11,509 BTC (no new purchases but retained)
- Marathon Digital Holdings: 32,000+ BTC (miner accumulation)`,

  keyPoints: [
    '94 public companies hold Bitcoin as treasury (June 2026)',
    'MicroStrategy holds 520,000 BTC — 2.5% of total supply',
    'FASB fair-value accounting change removes key adoption barrier',
    'Pace of new adopters doubled since ASU 2023-08 adoption',
    'Probex market: >100 companies by year-end now 54% probability',
  ],

  signals: [
    {
      id:              'sig-004-a',
      type:            'bullish-flag',
      label:           'Accounting Rule Catalyst',
      description:     'FASB fair-value standard removes CFO-level objection to BTC treasury exposure.',
      relevantMarkets: ['corp-btc-100-companies', 'btc-150k-dec-2026'],
      strength:        'moderate',
      confidence:      'medium',
    },
    {
      id:              'sig-004-b',
      type:            'watch',
      label:           '100-Company Milestone',
      description:     'Monitor adoption pace monthly. Currently 94 companies, 6 short of the Probex market resolution threshold.',
      relevantMarkets: ['corp-btc-100-companies'],
      strength:        'moderate',
      confidence:      'medium',
    },
  ],

  sources: [
    { label: 'Bitcoin Treasuries Database (bitcointreasuries.net)', type: 'public' },
    { label: 'FASB ASU 2023-08 Official Release',                   type: 'public' },
    { label: 'Strategy (MicroStrategy) SEC Filings',                type: 'public' },
  ],

  author:           RESEARCH_AUTHORS.alphaDeskHead!,
  tags:             ['institutional', 'treasury', 'corporate', 'microstrategy', 'fasb'],
  publishedAt:      new Date(Date.now() - 3_600_000 * 120).toISOString(),
  updatedAt:        new Date(Date.now() - 3_600_000 * 48).toISOString(),
  consensusScoreAtPublication: 0.72,
  featuredMarkets:  ['corp-btc-100-companies', 'microstrategy-500k-btc'],
}

// ─── Report 5: Macro Signals ──────────────────────────────────────────────

const macroReport: MacroReport = {
  id:              asReportId('report-005'),
  title:           'Macro Signals: Fed Rate Path Clears Bitcoin\'s Runway',
  subtitle:        'Two cuts in 2026 now base case — what it means for BTC/gold ratio',
  categoryId:      'macro-signals',
  format:          'signal-brief',
  status:          'published',
  sentiment:       'bullish',
  confidence:      'medium',
  relevantSegments: ['macro-signals', 'price-targets'],
  estimatedReadMinutes: 7,

  thesis: {
    statement:        'The Fed\'s pivot toward two rate cuts in 2026 reduces the opportunity cost of Bitcoin holdings and will accelerate institutional allocation.',
    confidence:       'medium',
    timeHorizon:      '90d',
    supportingFactors: [
      'Fed dot plot now shows median 2 cuts by year-end — consensus aligned',
      'DXY weakening: dollar index down 4.2% YTD — historically bullish for BTC',
      'Real rates declining from peak — Bitcoin outperforms in negative real rate environments',
      'BTC/Gold ratio at 22 — historical cycle peaks suggest 30–40x is achievable',
    ],
    risks: [
      'Labour market reacceleration could delay or cancel 2026 cuts',
      'Inflation resurgence (energy prices) would force Fed hawkish reversal',
      'Dollar safe-haven demand spike from geopolitical risk',
    ],
  },

  summary: 'The Federal Reserve\'s dot plot now indicates two rate cuts in 2026, with markets pricing the first cut for September. A declining DXY and falling real rates historically benefit Bitcoin. Our macro model suggests the BTC/Gold ratio could reach 30+ by Q4 2026.',

  body: `## Fed Rate Path Analysis

The June 2026 FOMC meeting produced a dot plot showing the median Fed member expects two 25bp cuts in 2026, with the first arriving in September. This represents a significant shift from the "higher for longer" posture of Q4 2025.

## Bitcoin's Macro Sensitivity

Bitcoin's correlation with equity markets has declined meaningfully in 2026 (correlation coefficient: 0.38, down from 0.65 in 2024). Meanwhile, its correlation with Gold has increased slightly (0.52), suggesting Bitcoin is increasingly viewed as a macro hedge rather than a risk asset.

## DXY and Bitcoin

The US Dollar Index (DXY) has declined 4.2% year-to-date, reaching 100.8. Historically, periods of DXY weakness correlate with Bitcoin outperformance. Our regression model shows a -0.71 correlation between DXY monthly returns and BTC returns with a 6-week lag.

## BTC/Gold Ratio Target

The BTC/Gold ratio currently stands at approximately 22 (BTC price ÷ gold price per oz). In the 2020–2021 bull cycle, this ratio peaked at 36. Given stronger institutional Bitcoin demand in 2026 vs 2020, we see a potential cycle peak of 30–40x, implying a BTC price target of $165,000–$220,000 at current gold prices.`,

  keyPoints: [
    'Fed dot plot: 2 cuts in 2026 — base case confirmed',
    'DXY down 4.2% YTD — historically bullish for BTC with 6-week lag',
    'BTC/gold correlation rising: Bitcoin increasingly viewed as macro hedge',
    'BTC/Gold ratio at 22 — cycle target 30–40x implies $165K–$220K',
    'Probex fed-cut market now at 57% probability — aligned with our macro base case',
  ],

  signals: [
    {
      id:              'sig-005-a',
      type:            'bullish-flag',
      label:           'DXY Weakness Tailwind',
      description:     '4.2% DXY decline YTD suggests continued dollar weakness that historically benefits BTC.',
      relevantMarkets: ['btc-150k-dec-2026', 'btc-outperforms-gold-ytd'],
      strength:        'moderate',
      confidence:      'medium',
    },
    {
      id:              'sig-005-b',
      type:            'catalyst',
      label:           'September Fed Cut',
      description:     'First Fed cut expected September 17 — watch for BTC reaction in the 2 weeks prior.',
      relevantMarkets: ['fed-cut-twice-2026', 'btc-150k-dec-2026'],
      strength:        'strong',
      confidence:      'medium',
      expiresAt:       '2026-09-30T00:00:00Z',
    },
  ],

  macroFactors: [
    { factor: 'Fed Rate Path (2 cuts)',          direction: 'bullish', weight: 'high'   },
    { factor: 'DXY Weakness',                   direction: 'bullish', weight: 'medium' },
    { factor: 'Real Rate Trajectory (falling)', direction: 'bullish', weight: 'high'   },
    { factor: 'BTC/Gold Ratio Expansion',       direction: 'bullish', weight: 'medium' },
    { factor: 'Equity Correlation (declining)', direction: 'bullish', weight: 'low'    },
    { factor: 'Labour Market Resilience',       direction: 'bearish', weight: 'medium' },
    { factor: 'Energy Price Risk',              direction: 'bearish', weight: 'low'    },
  ],

  sources: [
    { label: 'Federal Reserve June 2026 FOMC Press Release', type: 'public' },
    { label: 'Bloomberg DXY Historical Data',                type: 'market-data' },
    { label: 'Probex Macro Research Internal Model',         type: 'consensus-engine' },
  ],

  author:           RESEARCH_AUTHORS.macroDesk!,
  tags:             ['macro', 'fed', 'dxy', 'gold-ratio', 'rates', 'q3-2026'],
  publishedAt:      new Date(Date.now() - 3_600_000 * 96).toISOString(),
  updatedAt:        new Date(Date.now() - 3_600_000 * 10).toISOString(),
  consensusScoreAtPublication: 0.65,
  featuredMarkets:  ['fed-cut-twice-2026', 'btc-outperforms-gold-ytd', 'btc-gold-ratio-30'],
}

// ─── Report 6: Market Structure — BTC Dominance ────────────────────────────

const marketStructureReport: ResearchReport = {
  id:              asReportId('report-006'),
  title:           'BTC Dominance Breakout: The Alt-Season That Never Came',
  subtitle:        'Dominance above 58% and rising — structural case for continued BTC leadership',
  categoryId:      'market-structure',
  format:          'report',
  status:          'published',
  sentiment:       'strongly-bullish',
  confidence:      'medium',
  relevantSegments: ['market-structure', 'price-targets'],
  estimatedReadMinutes: 9,

  thesis: {
    statement:        'Bitcoin dominance will reach 65% by Q3 2026 end as institutional capital bypasses altcoins entirely, flowing directly into BTC via regulated ETF vehicles.',
    confidence:       'medium',
    timeHorizon:      '90d',
    supportingFactors: [
      'BTC dominance at 58.4% — highest since early 2021',
      'Stablecoin market cap growth ($162B) absorbs alt-would-be capital',
      'Ethereum ETF inflows weak relative to BTC ETFs — institutional preference clear',
      'No major DeFi or NFT catalyst visible to drive alt-rotation',
      'Regulatory clarity specific to BTC benefits dominance vs un-regulated alts',
    ],
    risks: [
      'Ethereum spot ETF surprise outperformance could trigger ETH/BTC ratio revival',
      'Solana ecosystem explosion with viral consumer dApp',
      'AI narrative re-igniting alt-season in AI-adjacent tokens',
    ],
  },

  summary: 'Bitcoin dominance sits at 58.4% — a multi-year high — as institutional capital enters the crypto market exclusively through regulated Bitcoin products. The Probex market for >65% BTC dominance by Q3 is at 58% probability and our analysis suggests this is achievable.',

  body: `## Dominance Analysis

Bitcoin's market cap dominance has been in a persistent uptrend since mid-2025, currently standing at 58.4%. This represents the highest dominance reading since January 2021, when Bitcoin peaked at $69,000.

## Why Altcoins Are Underperforming

The primary driver of BTC dominance expansion is structural, not cyclical. In prior cycles, retail investors drove alt-season by rotating BTC profits into smaller-cap tokens. In 2026, the marginal buyer of Bitcoin is an institutional allocator who has no interest in altcoins — they are buying IBIT, not Binance.

The stablecoin market cap ($162B) has absorbed significant capital that in prior cycles would have flowed into altcoins. Investors are sitting in USDC/USDT rather than buying Solana or Avalanche.

## Ethereum vs Bitcoin

The Ethereum/Bitcoin (ETH/BTC) ratio has declined 28% year-to-date, reaching 0.048. Despite Ethereum having its own spot ETF since May 2024, inflows have been approximately 8x weaker than Bitcoin ETFs. Institutional capital clearly prefers BTC.

## Path to 65%

For BTC dominance to reach 65%, approximately $180B would need to move from altcoins/stablecoins into Bitcoin (or Bitcoin's market cap would need to grow while alts remain flat). Given current ETF absorption rates ($73M/day), this is achievable within 3–6 months if altcoin prices remain range-bound.`,

  keyPoints: [
    'BTC dominance: 58.4% — highest since January 2021',
    'Institutional capital flows exclusively via regulated BTC ETFs — bypassing alts',
    'ETH/BTC ratio down 28% YTD — institutional preference for BTC clear',
    'Stablecoin market ($162B) absorbing would-be alt-rotation capital',
    'Path to 65%: achievable in 3–6 months given current ETF flow rates',
  ],

  signals: [
    {
      id:              'sig-006-a',
      type:            'bullish-flag',
      label:           'Dominance Trend Breakout',
      description:     'Multi-year resistance at 58% broken — next target is 62%, then 65%.',
      relevantMarkets: ['btc-dominance-65'],
      strength:        'strong',
      confidence:      'medium',
    },
    {
      id:              'sig-006-b',
      type:            'watch',
      label:           'Ethereum ETF Monitor',
      description:     'An unexpected surge in ETH ETF inflows would be the primary reversal risk to this thesis.',
      relevantMarkets: ['btc-dominance-65', 'btc-sp500-correlation'],
      strength:        'moderate',
      confidence:      'medium',
    },
  ],

  sources: [
    { label: 'CoinMarketCap Dominance Data',       type: 'market-data' },
    { label: 'Farside ETH ETF Flow Data',          type: 'etf-data' },
    { label: 'Probex Market Structure Analytics',  type: 'consensus-engine' },
  ],

  author:           RESEARCH_AUTHORS.quantModel!,
  tags:             ['dominance', 'market-structure', 'altcoins', 'institutional', 'etf'],
  publishedAt:      new Date(Date.now() - 3_600_000 * 144).toISOString(),
  updatedAt:        new Date(Date.now() - 3_600_000 * 72).toISOString(),
  consensusScoreAtPublication: 0.74,
  featuredMarkets:  ['btc-dominance-65', 'btc-150k-dec-2026'],
}

// ─── Exports ──────────────────────────────────────────────────────────────

export const MOCK_RESEARCH_REPORTS: ResearchReport[] = [
  btcOutlookReport,
  consensusReport,
  etfReport,
  institutionalReport,
  macroReport,
  marketStructureReport,
]

// ─── Post-process: add convenience aliases ─────────────────────────────────
// These aliases let components access r.category, r.readTime etc. without 
// knowing the internal naming convention.
for (const report of MOCK_RESEARCH_REPORTS) {
  const r = report as ResearchReport & {
    category: string
    segment: import('@/types/market').BitcoinSegment | null
    segments: import('@/types/market').BitcoinSegment[]
    readTime: number
  }
  r.category = report.categoryId
  r.segments = report.relevantSegments as import('@/types/market').BitcoinSegment[]
  r.segment = r.segments[0] ?? null
  r.readTime = report.estimatedReadMinutes
}


export function getReports(filters?: {
  categoryId?: ResearchCategoryId
  search?:     string
}): ResearchReport[] {
  let result = [...MOCK_RESEARCH_REPORTS]
  if (filters?.categoryId) {
    result = result.filter((r) => r.categoryId === filters.categoryId)
  }
  if (filters?.search?.trim()) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (r) => r.title.toLowerCase().includes(q) ||
             r.summary.toLowerCase().includes(q) ||
             r.tags.some((t) => t.includes(q)),
    )
  }
  return result
}

export function getReportById(id: string): ResearchReport | undefined {
  return MOCK_RESEARCH_REPORTS.find((r) => r.id === id)
}

export function getReportsByCategory(categoryId: ResearchCategoryId): ResearchReport[] {
  return MOCK_RESEARCH_REPORTS.filter((r) => r.categoryId === categoryId)
}

export function getLatestReport(): ResearchReport {
  return MOCK_RESEARCH_REPORTS.reduce((a, b) =>
    new Date(a.publishedAt) > new Date(b.publishedAt) ? a : b,
  )
}
