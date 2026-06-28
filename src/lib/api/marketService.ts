/**
 * Market Service
 * ──────────────
 * Service interface for all market data operations.
 * Interface definition only.
 * Mock implementation + hook integration.
 * Live implementation.
 */

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

/**
 * IMarketService
 * ──────────────
 * All market data access goes through this interface.
 * Components use hooks (useMarkets, useMarket) which call this service.
 */
export interface IMarketService {
  /**
   * Fetch a paginated list of markets with optional filters.
   * Cursor-based pagination (architecture review recommendation).
   */
  getMarkets(filters?: MarketFilters): Promise<PaginatedResponse<Market>>

  /**
   * Fetch a single market by ID.
   */
  getMarket(id: MarketId): Promise<Market>

  /**
   * Fetch historical price/probability data for charting.
   */
  getMarketHistory(
    id:    MarketId,
    range: TimeRange,
  ): Promise<PricePoint[]>

  /**
   * Fetch the current order book for a market.
   */
  getOrderBook(id: MarketId): Promise<OrderBook>

  /**
   * Subscribe to real-time market updates.
   * Returns an unsubscribe function.
   */
  subscribeToMarket(
    id:       MarketId,
    callback: (update: MarketUpdate) => void,
  ): Unsubscribe
}
