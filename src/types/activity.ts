import type { MarketId } from '@/types/branded'

export type ActivityType =
  | 'new-position-yes'
  | 'new-position-no'
  | 'market-resolved'
  | 'consensus-shift'
  | 'probability-spike'
  | 'large-position'

export interface ActivityItem {
  id:           string
  type:         ActivityType
  marketId:     MarketId
  marketTitle:  string
  segment:      string
  description:  string
  amount?:      number     // USD
  probability?: number     // current probability
  timestamp:    number     // Unix ms
}
