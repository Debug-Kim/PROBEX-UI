// Service interface for all market data operations (interface only; mock/live
// implementations live elsewhere). Components access it via hooks, not directly.

import type { MarketId } from '@/types/branded'
import type {
  Market,
  MarketFilters,
  PaginatedResponse,
  PricePoint,
  TimeRange,
  OrderBook,
  MarketUpdate,
} from '@/types/market'

export type Unsubscribe = () => void

/** All market data access goes through this interface (mock or live). */
export interface IMarketService {
  /** Cursor-paginated market list with optional filters. */
  getMarkets(filters?: MarketFilters): Promise<PaginatedResponse<Market>>

  getMarket(id: MarketId): Promise<Market>

  /** Historical price/probability series for charting. */
  getMarketHistory(
    id:    MarketId,
    range: TimeRange,
  ): Promise<PricePoint[]>

  getOrderBook(id: MarketId): Promise<OrderBook>

  /** Subscribe to live updates; call the returned unsubscribe to stop. */
  subscribeToMarket(
    id:       MarketId,
    callback: (update: MarketUpdate) => void,
  ): Unsubscribe
}
