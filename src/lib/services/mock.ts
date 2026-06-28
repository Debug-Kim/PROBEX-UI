/**
 * Mock service implementations
 * ────────────────────────────
 * Each class implements its interface by wrapping the EXISTING mock data — no
 * data or logic is duplicated. Async methods resolve immediately; the `peek*`
 * snapshots back the synchronous-first hooks so the UI never flashes a loading
 * state in mock mode. A live implementation swaps in behind the same registry.
 */

import { ok, ServiceException, type ApiResult, type PaginatedResponse } from './response'
import type {
  IMarketsService, IConsensusService, IPortfolioService, IResearchService,
  IAnalyticsService, IWalletService, INotificationsService, IActivityService,
  PositionScope, ServiceRegistry,
} from './interfaces'

import type { Market, MarketFilters, BitcoinSegment } from '@/types/market'
import { MOCK_MARKETS, getMarketById, getMarketsBySegment } from '@/mock/markets'

import type { ConsensusState, GlobalConsensusState, ConsensusHistoryPoint } from '@/types/consensus'
import { MOCK_CONSENSUS_MAP, MOCK_GLOBAL_CONSENSUS, getMockConsensusHistory } from '@/mock/consensus'

import type { Position, WalletBalance, WalletConnection, Transaction } from '@/types/wallet'
import { computePortfolioSummary, computeAllocationBySegment, type PortfolioSummary, type AllocationSlice } from '@/mock/portfolio'
import { getOpenPositions, getSettledPositions, ALL_POSITIONS } from '@/mock/positions'
import { getRecentPerformance, type PerformancePoint } from '@/mock/performance'

import type { ResearchReport, ResearchCategory, ResearchFilters } from '@/types/research'
import { getReports, getReportById, RESEARCH_CATEGORIES } from '@/mock/research'

import type {
  AnalyticsDashboard, ConsensusAccuracyPoint, ETFFlowPoint, SegmentPerformanceRecord,
} from '@/types/analytics'
import { ANALYTICS_DASHBOARD, getConsensusAccuracyHistory, getETFFlowHistory, SEGMENT_ANALYTICS } from '@/mock/analytics'

import { getMockWalletBalance, MOCK_WALLET_CONNECTION } from '@/mock/wallet'
import { getTransactions } from '@/mock/transactions'

import { MOCK_NOTIFICATIONS, type NotificationItem } from '@/mock/notifications'
import { MOCK_ACTIVITY, type ActivityItem } from '@/mock/activity'

const notFound = (kind: string, id: string) => new ServiceException('NOT_FOUND', `${kind} not found: ${id}`)

/** Build the getReports() filter, omitting undefined fields (exactOptionalPropertyTypes). */
function toReportFilter(f?: ResearchFilters): Parameters<typeof getReports>[0] {
  if (!f) return undefined
  const out: NonNullable<Parameters<typeof getReports>[0]> = {}
  if (f.categoryId) out.categoryId = f.categoryId
  if (f.search) out.search = f.search
  return out
}

// ─── Markets ──────────────────────────────────────────────────────────────────

class MockMarketsService implements IMarketsService {
  peekMarkets(filters?: MarketFilters): PaginatedResponse<Market> {
    let items = MOCK_MARKETS
    if (filters?.segment) items = items.filter((m) => m.segment === filters.segment)
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      items = items.filter((m) => m.title.toLowerCase().includes(q))
    }
    return { data: items, total: items.length, cursor: null, hasMore: false }
  }
  peekMarket(id: string): Market | null { return getMarketById(id) ?? null }

  async listMarkets(filters?: MarketFilters): Promise<ApiResult<PaginatedResponse<Market>>> {
    return ok(this.peekMarkets(filters))
  }
  async getMarket(id: string): Promise<ApiResult<Market>> {
    const m = getMarketById(id)
    if (!m) throw notFound('Market', id)
    return ok(m)
  }
  async getBySegment(segment: BitcoinSegment): Promise<ApiResult<Market[]>> {
    return ok(getMarketsBySegment(segment))
  }
}

// ─── Consensus ─────────────────────────────────────────────────────────────────

class MockConsensusService implements IConsensusService {
  peekConsensus(id: string): ConsensusState | null { return MOCK_CONSENSUS_MAP[id] ?? null }
  peekGlobal(): GlobalConsensusState { return MOCK_GLOBAL_CONSENSUS }

  async getMarketConsensus(id: string): Promise<ApiResult<ConsensusState>> {
    const c = MOCK_CONSENSUS_MAP[id]
    if (!c) throw notFound('Consensus', id)
    return ok(c)
  }
  async getGlobalConsensus(): Promise<ApiResult<GlobalConsensusState>> { return ok(MOCK_GLOBAL_CONSENSUS) }
  async getConsensusHistory(id: string, points = 30): Promise<ApiResult<ConsensusHistoryPoint[]>> {
    return ok(getMockConsensusHistory(id, points))
  }
}

// ─── Portfolio ─────────────────────────────────────────────────────────────────

function positionsFor(scope: PositionScope): Position[] {
  if (scope === 'open')    return getOpenPositions()
  if (scope === 'settled') return getSettledPositions()
  return ALL_POSITIONS
}

class MockPortfolioService implements IPortfolioService {
  peekSummary(): PortfolioSummary { return computePortfolioSummary() }
  peekPositions(scope: PositionScope = 'all'): Position[] { return positionsFor(scope) }

  async getSummary(): Promise<ApiResult<PortfolioSummary>> { return ok(computePortfolioSummary()) }
  async getAllocation(): Promise<ApiResult<AllocationSlice[]>> { return ok(computeAllocationBySegment()) }
  async listPositions(scope: PositionScope = 'all'): Promise<ApiResult<Position[]>> { return ok(positionsFor(scope)) }
  async getPerformance(days = 30): Promise<ApiResult<PerformancePoint[]>> { return ok(getRecentPerformance(days)) }
}

// ─── Research ──────────────────────────────────────────────────────────────────

class MockResearchService implements IResearchService {
  peekReports(filters?: ResearchFilters): PaginatedResponse<ResearchReport> {
    const reports = getReports(toReportFilter(filters))
    return { data: reports, total: reports.length, cursor: null, hasMore: false }
  }
  async listReports(filters?: ResearchFilters): Promise<ApiResult<PaginatedResponse<ResearchReport>>> {
    return ok(this.peekReports(filters))
  }
  async getReport(id: string): Promise<ApiResult<ResearchReport>> {
    const r = getReportById(id)
    if (!r) throw notFound('Report', id)
    return ok(r)
  }
  async listCategories(): Promise<ApiResult<ResearchCategory[]>> { return ok(RESEARCH_CATEGORIES) }
}

// ─── Analytics ─────────────────────────────────────────────────────────────────

class MockAnalyticsService implements IAnalyticsService {
  peekDashboard(): AnalyticsDashboard { return ANALYTICS_DASHBOARD }
  async getDashboard(): Promise<ApiResult<AnalyticsDashboard>> { return ok(ANALYTICS_DASHBOARD) }
  async getConsensusAccuracy(): Promise<ApiResult<ConsensusAccuracyPoint[]>> { return ok(getConsensusAccuracyHistory()) }
  async getETFFlows(): Promise<ApiResult<ETFFlowPoint[]>> { return ok(getETFFlowHistory()) }
  async getSegmentPerformance(): Promise<ApiResult<SegmentPerformanceRecord[]>> { return ok(SEGMENT_ANALYTICS) }
}

// ─── Wallet ────────────────────────────────────────────────────────────────────

class MockWalletService implements IWalletService {
  peekBalance(): WalletBalance { return getMockWalletBalance() }
  async getBalance(): Promise<ApiResult<WalletBalance>> { return ok(getMockWalletBalance()) }
  async getConnection(): Promise<ApiResult<WalletConnection>> { return ok(MOCK_WALLET_CONNECTION) }
  async listTransactions(): Promise<ApiResult<Transaction[]>> { return ok(getTransactions()) }
}

// ─── Notifications ─────────────────────────────────────────────────────────────

class MockNotificationsService implements INotificationsService {
  peek(): NotificationItem[] { return MOCK_NOTIFICATIONS }
  async list(): Promise<ApiResult<NotificationItem[]>> { return ok(MOCK_NOTIFICATIONS) }
  async markAllRead(): Promise<ApiResult<NotificationItem[]>> {
    return ok(MOCK_NOTIFICATIONS.map((n) => ({ ...n, read: true })))
  }
}

// ─── Activity ──────────────────────────────────────────────────────────────────

class MockActivityService implements IActivityService {
  peek(limit?: number): ActivityItem[] { return limit ? MOCK_ACTIVITY.slice(0, limit) : MOCK_ACTIVITY }
  async list(limit?: number): Promise<ApiResult<ActivityItem[]>> { return ok(this.peek(limit)) }
}

// ─── Registry ──────────────────────────────────────────────────────────────────

export const mockServices: ServiceRegistry = {
  markets:       new MockMarketsService(),
  consensus:     new MockConsensusService(),
  portfolio:     new MockPortfolioService(),
  research:      new MockResearchService(),
  analytics:     new MockAnalyticsService(),
  wallet:        new MockWalletService(),
  notifications: new MockNotificationsService(),
  activity:      new MockActivityService(),
}
