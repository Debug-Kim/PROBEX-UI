/**
 * Service interfaces — the integration contract
 * ─────────────────────────────────────────────
 * Eight domain services. Each method is async (the backend contract); each
 * read also exposes an optional synchronous `peek*` that returns an immediate
 * snapshot when one is available (the mock returns data; a live impl returns
 * cached-or-null, which drives the loading state). Real-time streaming is NOT
 * duplicated here — it remains in lib/realtime.
 */

import type { ApiResult, PaginatedResponse } from './response'

import type { Market, MarketFilters, BitcoinSegment } from '@/types/market'
import type { ConsensusState, GlobalConsensusState, ConsensusHistoryPoint } from '@/types/consensus'
import type { Position, WalletBalance, WalletConnection, Transaction } from '@/types/wallet'
import type { ResearchReport, ResearchCategory, ResearchFilters } from '@/types/research'
import type {
  AnalyticsDashboard, ConsensusAccuracyPoint, ETFFlowPoint, SegmentPerformanceRecord,
} from '@/types/analytics'
import type { PortfolioSummary, AllocationSlice } from '@/mock/portfolio'
import type { PerformancePoint } from '@/mock/performance'
import type { NotificationItem } from '@/mock/notifications'
import type { ActivityItem } from '@/mock/activity'

export type PositionScope = 'open' | 'settled' | 'all'

// ─── Markets ──────────────────────────────────────────────────────────────────

export interface IMarketsService {
  listMarkets(filters?: MarketFilters):           Promise<ApiResult<PaginatedResponse<Market>>>
  getMarket(id: string):                          Promise<ApiResult<Market>>
  getBySegment(segment: BitcoinSegment):          Promise<ApiResult<Market[]>>
  peekMarkets?(filters?: MarketFilters):          PaginatedResponse<Market> | null
  peekMarket?(id: string):                        Market | null
}

// ─── Consensus ─────────────────────────────────────────────────────────────────

export interface IConsensusService {
  getMarketConsensus(id: string):                 Promise<ApiResult<ConsensusState>>
  getGlobalConsensus():                           Promise<ApiResult<GlobalConsensusState>>
  getConsensusHistory(id: string, points?: number): Promise<ApiResult<ConsensusHistoryPoint[]>>
  peekConsensus?(id: string):                     ConsensusState | null
  peekGlobal?():                                  GlobalConsensusState | null
}

// ─── Portfolio ─────────────────────────────────────────────────────────────────

export interface IPortfolioService {
  getSummary():                                   Promise<ApiResult<PortfolioSummary>>
  getAllocation():                                Promise<ApiResult<AllocationSlice[]>>
  listPositions(scope?: PositionScope):           Promise<ApiResult<Position[]>>
  getPerformance(days?: number):                  Promise<ApiResult<PerformancePoint[]>>
  peekSummary?():                                 PortfolioSummary | null
  peekPositions?(scope?: PositionScope):          Position[] | null
}

// ─── Research ──────────────────────────────────────────────────────────────────

export interface IResearchService {
  listReports(filters?: ResearchFilters):         Promise<ApiResult<PaginatedResponse<ResearchReport>>>
  getReport(id: string):                          Promise<ApiResult<ResearchReport>>
  listCategories():                               Promise<ApiResult<ResearchCategory[]>>
  peekReports?(filters?: ResearchFilters):        PaginatedResponse<ResearchReport> | null
}

// ─── Analytics ─────────────────────────────────────────────────────────────────

export interface IAnalyticsService {
  getDashboard():                                 Promise<ApiResult<AnalyticsDashboard>>
  getConsensusAccuracy():                         Promise<ApiResult<ConsensusAccuracyPoint[]>>
  getETFFlows():                                  Promise<ApiResult<ETFFlowPoint[]>>
  getSegmentPerformance():                        Promise<ApiResult<SegmentPerformanceRecord[]>>
  peekDashboard?():                               AnalyticsDashboard | null
}

// ─── Wallet ────────────────────────────────────────────────────────────────────

export interface IWalletService {
  getBalance():                                   Promise<ApiResult<WalletBalance>>
  getConnection():                                Promise<ApiResult<WalletConnection>>
  listTransactions():                             Promise<ApiResult<Transaction[]>>
  peekBalance?():                                 WalletBalance | null
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export interface INotificationsService {
  list():                                         Promise<ApiResult<NotificationItem[]>>
  markAllRead():                                  Promise<ApiResult<NotificationItem[]>>
  peek?():                                        NotificationItem[] | null
}

// ─── Activity ──────────────────────────────────────────────────────────────────

export interface IActivityService {
  list(limit?: number):                           Promise<ApiResult<ActivityItem[]>>
  peek?(limit?: number):                          ActivityItem[] | null
}

// ─── Registry shape ────────────────────────────────────────────────────────────

export interface ServiceRegistry {
  markets:       IMarketsService
  consensus:     IConsensusService
  portfolio:     IPortfolioService
  research:      IResearchService
  analytics:     IAnalyticsService
  wallet:        IWalletService
  notifications: INotificationsService
  activity:      IActivityService
}
