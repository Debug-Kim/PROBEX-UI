import type { MarketId } from '@/types/branded'

export type MarketEventType =
  | 'buy-yes'
  | 'buy-no'
  | 'consensus-update'
  | 'probability-change'
  | 'large-trade'
  | 'market-update'

export interface MarketActivityEvent {
  id:           string
  type:         MarketEventType
  marketId:     MarketId
  actor:        string
  description:  string
  summary:      string
  ts:           number
  amount?:      number
  priceBefore?: number
  priceAfter?:  number
  scoreBefore?: number
  scoreAfter?:  number
}

export interface KeyDriver {
  label:       string
  description: string
  direction:   'bullish' | 'bearish' | 'neutral'
  weight:      'high' | 'medium' | 'low'
}

export interface MarketResearch {
  marketId:          MarketId
  summary:           string
  keyDrivers:        KeyDriver[]
  supportingSignals: string[]
  risks:             string[]
  analystNotes:      string
  lastUpdated:       string
  analystHandle:     string
}

export interface RelatedMarket {
  id:          string
  title:       string
  probability: number
  consensus:   number
  correlation: 'positive' | 'negative' | 'neutral'
}
