import type { ResearchCategory } from '@/types/research'

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
