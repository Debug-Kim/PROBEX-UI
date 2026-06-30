// Each class implements its interface by wrapping the EXISTING mock data — no
// data or logic is duplicated. Async methods resolve immediately; the `peek*`
// snapshots back the synchronous-first hooks so the UI never flashes a loading
// state in mock mode. A live implementation swaps in behind the same registry.

import { ok, ServiceException, type ApiResult, type PaginatedResponse } from './response'
import type {
  IMarketsService, IConsensusService, IPortfolioService, IResearchService,
  IAnalyticsService, IWalletService, INotificationsService, IActivityService,
  IAdminService, ISettingsService,
  PositionScope, ServiceRegistry, MarketHistoryPoint, ConsensusBreakdownPoint, VolumeHistoryPoint,
} from './interfaces'
import type { AdminKPIs, AdminUser, AdminMarket, AuditEntry, KYCApplication, SystemHealth, RiskDashboard } from '@/types/admin'
import type { DeviceSession } from '@/types/settings'
import type { MarketActivityEvent, MarketResearch, RelatedMarket } from '@/types/marketDetail'
import type { ConfidencePoint, ConsensusSnapshot } from '@/types/intelligence'
import type { PortfolioSummary, AllocationSlice, PerformancePoint, WinRatePoint, PortfolioActivityEvent } from '@/types/portfolio'

import type { Market, MarketFilters, BitcoinSegment, TimeRange } from '@/types/market'
import { MOCK_MARKETS, getMarketById, getMarketsBySegment } from '@/mock/markets'
import { getProbabilityHistory, getConsensusHistory, getVolumeHistory } from '@/mock/marketHistory'

import type { ConsensusState, GlobalConsensusState, ConsensusHistoryPoint } from '@/types/consensus'
import { MOCK_CONSENSUS_MAP, MOCK_GLOBAL_CONSENSUS, getMockConsensusHistory } from '@/mock/consensus'

import type { Position, WalletBalance, WalletConnection, Transaction } from '@/types/wallet'
import { computePortfolioSummary, computeAllocationBySegment } from '@/mock/portfolio'
import { getOpenPositions, getSettledPositions, ALL_POSITIONS } from '@/mock/positions'
import { getRecentPerformance, generateWinRateHistory } from '@/mock/performance'
import { getPortfolioActivity } from '@/mock/portfolioActivity'

import type { ResearchReport, ResearchCategory, ResearchFilters } from '@/types/research'
import { getReports, getReportById, RESEARCH_CATEGORIES } from '@/mock/research'

import type {
  AnalyticsDashboard, ConsensusAccuracyPoint, ConsensusStrengthPoint, ConfidenceTrendPoint,
  ETFFlowPoint, InstitutionalFlowPoint, MarketActivityPoint, OnChainMetricPoint,
  SegmentPerformanceRecord, SignalPerformanceRecord,
  ConsensusAnalyticsSummary, InstitutionalFlowSummary, ETFAnalyticsSummary,
  OnChainSummary, PortfolioAnalyticsSummary,
} from '@/types/analytics'
import {
  ANALYTICS_DASHBOARD,
  getConsensusAccuracyHistory, getConsensusStrengthHistory, getConfidenceTrendHistory,
  getETFFlowHistory, getInstitutionalFlowHistory, getMarketActivityHistory, getOnChainHistory,
  SEGMENT_ANALYTICS, SIGNAL_PERFORMANCE,
  CONSENSUS_ANALYTICS_SUMMARY, INSTITUTIONAL_FLOW_SUMMARY, ETF_ANALYTICS_SUMMARY,
  ON_CHAIN_SUMMARY, PORTFOLIO_ANALYTICS_SUMMARY,
} from '@/mock/analytics'

import { getMockWalletBalance, MOCK_WALLET_CONNECTION, MOCK_PENDING_FUNDS } from '@/mock/wallet'
import { getTransactions } from '@/mock/transactions'
import type { PendingFunds } from '@/types/wallet'

import { MOCK_NOTIFICATIONS, type NotificationItem } from '@/mock/notifications'
import { MOCK_ACTIVITY, type ActivityItem } from '@/mock/activity'
import { getRelatedMarkets, getResearch } from '@/mock/marketDetails'
import { getMarketActivity as getMockMarketActivity } from '@/mock/marketActivity'
import {
  ADMIN_USERS, ADMIN_MARKETS, AUDIT_LOG, KYC_QUEUE,
  SERVICE_STATUS, SYSTEM_METRICS, THROUGHPUT_SERIES, RISK_METRICS, RISK_ALERTS,
  EXPOSURE_SERIES, ADMIN_KPIS,
} from '@/mock/admin'
import { MOCK_SESSIONS } from '@/mock/settings'
import {
  getConfidenceEvolution as computeConfidenceEvolution,
  getHistoricalSnapshotsFromHistory,
} from '@/lib/consensus/intelligence'

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
  peekMarketHistory(id: string, range: TimeRange = '7d'): MarketHistoryPoint[] { return getProbabilityHistory(id, range) }
  peekVolumeHistory(id: string, range: TimeRange = '7d'): VolumeHistoryPoint[] { return getVolumeHistory(id, range) }

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
  async getMarketHistory(id: string, range: TimeRange = '7d'): Promise<ApiResult<MarketHistoryPoint[]>> {
    return ok(getProbabilityHistory(id, range))
  }
  async getVolumeHistory(id: string, range: TimeRange = '7d'): Promise<ApiResult<VolumeHistoryPoint[]>> {
    return ok(getVolumeHistory(id, range))
  }
  peekRelatedMarkets(id: string): RelatedMarket[] { return getRelatedMarkets(id) }
  peekMarketResearch(id: string): MarketResearch | null { return getResearch(id) ?? null }
  peekMarketActivity(id: string, count = 20): MarketActivityEvent[] { return getMockMarketActivity(id, count) }
  async getRelatedMarkets(id: string): Promise<ApiResult<RelatedMarket[]>> { return ok(getRelatedMarkets(id)) }
  async getMarketResearch(id: string): Promise<ApiResult<MarketResearch>> {
    const r = getResearch(id)
    if (!r) throw notFound('MarketResearch', id)
    return ok(r)
  }
  async getMarketActivity(id: string, count = 20): Promise<ApiResult<MarketActivityEvent[]>> {
    return ok(getMockMarketActivity(id, count))
  }
}

// ─── Consensus ─────────────────────────────────────────────────────────────────

class MockConsensusService implements IConsensusService {
  peekConsensus(id: string): ConsensusState | null { return MOCK_CONSENSUS_MAP[id] ?? null }
  peekGlobal(): GlobalConsensusState { return MOCK_GLOBAL_CONSENSUS }
  peekConsensusMap(): Record<string, ConsensusState> { return MOCK_CONSENSUS_MAP }
  peekConsensusHistory(id: string, points = 30): ConsensusHistoryPoint[] { return getMockConsensusHistory(id, points) }

  async getMarketConsensus(id: string): Promise<ApiResult<ConsensusState>> {
    const c = MOCK_CONSENSUS_MAP[id]
    if (!c) throw notFound('Consensus', id)
    return ok(c)
  }
  async getGlobalConsensus(): Promise<ApiResult<GlobalConsensusState>> { return ok(MOCK_GLOBAL_CONSENSUS) }
  async getConsensusHistory(id: string, points = 30): Promise<ApiResult<ConsensusHistoryPoint[]>> {
    return ok(getMockConsensusHistory(id, points))
  }
  async getConfidenceEvolution(id: string, base: number): Promise<ApiResult<ConfidencePoint[]>> {
    return ok(computeConfidenceEvolution(id, base))
  }
  async getHistoricalSnapshots(id: string): Promise<ApiResult<ConsensusSnapshot[]>> {
    return ok(getHistoricalSnapshotsFromHistory(getMockConsensusHistory(id, 30)))
  }
  async listConsensus(): Promise<ApiResult<Record<string, ConsensusState>>> { return ok(MOCK_CONSENSUS_MAP) }

  peekConsensusBreakdownHistory(id: string, range: TimeRange = '7d'): ConsensusBreakdownPoint[] { return getConsensusHistory(id, range) }
  async getConsensusBreakdownHistory(id: string, range: TimeRange = '7d'): Promise<ApiResult<ConsensusBreakdownPoint[]>> {
    return ok(getConsensusHistory(id, range))
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
  peekAllocation(): AllocationSlice[] { return computeAllocationBySegment() }
  peekPerformance(days = 30): PerformancePoint[] { return getRecentPerformance(days) }
  peekWinRateHistory(): WinRatePoint[] { return generateWinRateHistory() }
  peekActivity(limit?: number): PortfolioActivityEvent[] { return getPortfolioActivity(limit) }

  async getSummary(): Promise<ApiResult<PortfolioSummary>> { return ok(computePortfolioSummary()) }
  async getAllocation(): Promise<ApiResult<AllocationSlice[]>> { return ok(computeAllocationBySegment()) }
  async listPositions(scope: PositionScope = 'all'): Promise<ApiResult<Position[]>> { return ok(positionsFor(scope)) }
  async getPerformance(days = 30): Promise<ApiResult<PerformancePoint[]>> { return ok(getRecentPerformance(days)) }
  async getWinRateHistory(): Promise<ApiResult<WinRatePoint[]>> { return ok(generateWinRateHistory()) }
  async getActivity(limit?: number): Promise<ApiResult<PortfolioActivityEvent[]>> { return ok(getPortfolioActivity(limit)) }
}

// ─── Research ──────────────────────────────────────────────────────────────────

class MockResearchService implements IResearchService {
  peekReports(filters?: ResearchFilters): PaginatedResponse<ResearchReport> {
    const reports = getReports(toReportFilter(filters))
    return { data: reports, total: reports.length, cursor: null, hasMore: false }
  }
  peekReport(id: string): ResearchReport | null { return getReportById(id) ?? null }
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
  peekDashboard():                        AnalyticsDashboard          { return ANALYTICS_DASHBOARD }
  peekConsensusAccuracy():                ConsensusAccuracyPoint[]    { return getConsensusAccuracyHistory() }
  peekConsensusStrengthHistory():         ConsensusStrengthPoint[]    { return getConsensusStrengthHistory() }
  peekConfidenceTrendHistory():           ConfidenceTrendPoint[]      { return getConfidenceTrendHistory() }
  peekETFFlows():                         ETFFlowPoint[]              { return getETFFlowHistory() }
  peekInstitutionalFlowHistory():         InstitutionalFlowPoint[]    { return getInstitutionalFlowHistory() }
  peekMarketActivityHistory():            MarketActivityPoint[]       { return getMarketActivityHistory() }
  peekOnChainHistory(metricId: string):   OnChainMetricPoint[]        { return getOnChainHistory(metricId) }
  peekOnChainSnapshots():                 Record<string, OnChainMetricPoint> {
    return Object.fromEntries(
      ['mvrv','sopr','exchange-reserve','hashrate','difficulty','whale-accumulation','nupl','puell-multiple']
        .map((id) => [id, getOnChainHistory(id).at(-1)!] as const)
        .filter(([, v]) => v !== undefined),
    )
  }
  peekSegmentPerformance():              SegmentPerformanceRecord[]   { return SEGMENT_ANALYTICS }
  peekSignalPerformance():               SignalPerformanceRecord[]    { return SIGNAL_PERFORMANCE }
  peekConsensusSummary():                ConsensusAnalyticsSummary   { return CONSENSUS_ANALYTICS_SUMMARY }
  peekInstitutionalSummary():            InstitutionalFlowSummary    { return INSTITUTIONAL_FLOW_SUMMARY }
  peekETFSummary():                      ETFAnalyticsSummary         { return ETF_ANALYTICS_SUMMARY }
  peekOnChainSummary():                  OnChainSummary              { return ON_CHAIN_SUMMARY }
  peekPortfolioAnalyticsSummary():       PortfolioAnalyticsSummary   { return PORTFOLIO_ANALYTICS_SUMMARY }

  async getDashboard():                                    Promise<ApiResult<AnalyticsDashboard>>          { return ok(ANALYTICS_DASHBOARD) }
  async getConsensusAccuracy():                            Promise<ApiResult<ConsensusAccuracyPoint[]>>    { return ok(getConsensusAccuracyHistory()) }
  async getConsensusStrengthHistory():                     Promise<ApiResult<ConsensusStrengthPoint[]>>    { return ok(getConsensusStrengthHistory()) }
  async getConfidenceTrendHistory():                       Promise<ApiResult<ConfidenceTrendPoint[]>>      { return ok(getConfidenceTrendHistory()) }
  async getETFFlows():                                     Promise<ApiResult<ETFFlowPoint[]>>              { return ok(getETFFlowHistory()) }
  async getInstitutionalFlowHistory():                     Promise<ApiResult<InstitutionalFlowPoint[]>>    { return ok(getInstitutionalFlowHistory()) }
  async getMarketActivityHistory():                        Promise<ApiResult<MarketActivityPoint[]>>       { return ok(getMarketActivityHistory()) }
  async getOnChainHistory(metricId: string):               Promise<ApiResult<OnChainMetricPoint[]>>        { return ok(getOnChainHistory(metricId)) }
  async getOnChainSnapshots():                             Promise<ApiResult<Record<string, OnChainMetricPoint>>> { return ok(this.peekOnChainSnapshots()) }
  async getSegmentPerformance():                           Promise<ApiResult<SegmentPerformanceRecord[]>>  { return ok(SEGMENT_ANALYTICS) }
  async getSignalPerformance():                            Promise<ApiResult<SignalPerformanceRecord[]>>   { return ok(SIGNAL_PERFORMANCE) }
  async getConsensusSummary():                             Promise<ApiResult<ConsensusAnalyticsSummary>>  { return ok(CONSENSUS_ANALYTICS_SUMMARY) }
  async getInstitutionalSummary():                         Promise<ApiResult<InstitutionalFlowSummary>>   { return ok(INSTITUTIONAL_FLOW_SUMMARY) }
  async getETFSummary():                                   Promise<ApiResult<ETFAnalyticsSummary>>        { return ok(ETF_ANALYTICS_SUMMARY) }
  async getOnChainSummary():                               Promise<ApiResult<OnChainSummary>>             { return ok(ON_CHAIN_SUMMARY) }
  async getPortfolioAnalyticsSummary():                    Promise<ApiResult<PortfolioAnalyticsSummary>>  { return ok(PORTFOLIO_ANALYTICS_SUMMARY) }
}

// ─── Wallet ────────────────────────────────────────────────────────────────────

class MockWalletService implements IWalletService {
  peekBalance(): WalletBalance { return getMockWalletBalance() }
  peekConnection(): WalletConnection { return MOCK_WALLET_CONNECTION }
  peekTransactions(): Transaction[] { return getTransactions() }
  peekPendingFunds(): PendingFunds { return MOCK_PENDING_FUNDS }

  async getBalance(): Promise<ApiResult<WalletBalance>> { return ok(getMockWalletBalance()) }
  async getConnection(): Promise<ApiResult<WalletConnection>> { return ok(MOCK_WALLET_CONNECTION) }
  async listTransactions(): Promise<ApiResult<Transaction[]>> { return ok(getTransactions()) }
  async getPendingFunds(): Promise<ApiResult<PendingFunds>> { return ok(MOCK_PENDING_FUNDS) }
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

// ─── Admin ─────────────────────────────────────────────────────────────────────

class MockAdminService implements IAdminService {
  peekKPIs():          AdminKPIs        { return ADMIN_KPIS }
  peekUsers():         AdminUser[]      { return ADMIN_USERS }
  peekAdminMarkets():  AdminMarket[]    { return ADMIN_MARKETS }
  peekAuditLog():      AuditEntry[]     { return AUDIT_LOG }
  peekKYCQueue():      KYCApplication[] { return KYC_QUEUE }
  peekSystemHealth():  SystemHealth     { return { services: SERVICE_STATUS, metrics: SYSTEM_METRICS, throughput: THROUGHPUT_SERIES } }
  peekRiskDashboard(): RiskDashboard    { return { metrics: RISK_METRICS, alerts: RISK_ALERTS, exposureSeries: EXPOSURE_SERIES } }

  async getKPIs():          Promise<ApiResult<AdminKPIs>>        { return ok(this.peekKPIs()) }
  async listUsers():        Promise<ApiResult<AdminUser[]>>       { return ok(ADMIN_USERS) }
  async listAdminMarkets(): Promise<ApiResult<AdminMarket[]>>     { return ok(ADMIN_MARKETS) }
  async getAuditLog():      Promise<ApiResult<AuditEntry[]>>      { return ok(AUDIT_LOG) }
  async getKYCQueue():      Promise<ApiResult<KYCApplication[]>>  { return ok(KYC_QUEUE) }
  async getSystemHealth():  Promise<ApiResult<SystemHealth>>      { return ok(this.peekSystemHealth()) }
  async getRiskDashboard(): Promise<ApiResult<RiskDashboard>>     { return ok(this.peekRiskDashboard()) }
}

// ─── Settings ──────────────────────────────────────────────────────────────────

class MockSettingsService implements ISettingsService {
  peekSessions(): DeviceSession[] { return MOCK_SESSIONS }
  async getSessions(): Promise<ApiResult<DeviceSession[]>> { return ok(MOCK_SESSIONS) }
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
  admin:         new MockAdminService(),
  settings:      new MockSettingsService(),
}
