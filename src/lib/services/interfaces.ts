// Domain service interfaces. Each method is async (the backend contract); each
// read also exposes an optional synchronous `peek*` that returns an immediate
// snapshot when one is available (the mock returns data; a live impl returns
// cached-or-null, which drives the loading state). Real-time streaming is NOT
// duplicated here — it remains in lib/realtime.

import type { ApiResult, PaginatedResponse } from './response'

import type {
  EngineHealth, EngineRuntime, EngineStats, EngineConfig,
  SurvivalStatus, PriceHistory,
  EngineMarkets, EnginePositions, EngineEvents, EngineEdges,
} from '@/types/engine'
import type { Market, MarketFilters, BitcoinSegment, TimeRange } from '@/types/market'
import type { ConsensusState, GlobalConsensusState, ConsensusHistoryPoint } from '@/types/consensus'
import type { Position, WalletBalance, WalletConnection, Transaction, PendingFunds } from '@/types/wallet'
import type { ResearchReport, ResearchCategory, ResearchFilters } from '@/types/research'
import type {
  AnalyticsDashboard, ConsensusAccuracyPoint, ConsensusStrengthPoint, ConfidenceTrendPoint,
  ETFFlowPoint, InstitutionalFlowPoint, MarketActivityPoint, OnChainMetricPoint,
  SegmentPerformanceRecord, SignalPerformanceRecord,
  ConsensusAnalyticsSummary, InstitutionalFlowSummary, ETFAnalyticsSummary,
  OnChainSummary, PortfolioAnalyticsSummary,
} from '@/types/analytics'
import type { PortfolioSummary, AllocationSlice, PerformancePoint, WinRatePoint, PortfolioActivityEvent } from '@/types/portfolio'
import type { NotificationItem } from '@/types/notifications'
import type { ActivityItem } from '@/types/activity'
import type { AdminKPIs, AdminUser, AdminMarket, AuditEntry, KYCApplication, SystemHealth, RiskDashboard } from '@/types/admin'
import type { DeviceSession } from '@/types/settings'
import type { MarketActivityEvent, MarketResearch, RelatedMarket } from '@/types/marketDetail'
import type { ConfidencePoint, ConsensusSnapshot } from '@/types/intelligence'

export type PositionScope = 'open' | 'settled' | 'all'

/** Market price/probability history point (sparkline + chart shape). */
export interface MarketHistoryPoint {
  ts:          number
  probability: number
  volume:      number
}

/** Consensus score breakdown over time (institutional + retail components). */
export interface ConsensusBreakdownPoint {
  ts:          number
  score:       number
  instScore:   number
  retailScore: number
}

/** YES/NO volume breakdown over time. */
export interface VolumeHistoryPoint {
  ts:      number
  volume:  number
  yesVol:  number
  noVol:   number
}

// ─── Markets ──────────────────────────────────────────────────────────────────

export interface IMarketsService {
  listMarkets(filters?: MarketFilters):                  Promise<ApiResult<PaginatedResponse<Market>>>
  getMarket(id: string):                                 Promise<ApiResult<Market>>
  getBySegment(segment: BitcoinSegment):                 Promise<ApiResult<Market[]>>
  getMarketHistory(id: string, range?: TimeRange):       Promise<ApiResult<MarketHistoryPoint[]>>
  getVolumeHistory(id: string, range?: TimeRange):       Promise<ApiResult<VolumeHistoryPoint[]>>
  getRelatedMarkets(id: string):                         Promise<ApiResult<RelatedMarket[]>>
  getMarketResearch(id: string):                         Promise<ApiResult<MarketResearch>>
  getMarketActivity(id: string, count?: number):         Promise<ApiResult<MarketActivityEvent[]>>
  peekMarkets?(filters?: MarketFilters):                 PaginatedResponse<Market> | null
  peekMarket?(id: string):                               Market | null
  peekMarketHistory?(id: string, range?: TimeRange):     MarketHistoryPoint[] | null
  peekVolumeHistory?(id: string, range?: TimeRange):     VolumeHistoryPoint[] | null
  peekRelatedMarkets?(id: string):                       RelatedMarket[] | null
  peekMarketResearch?(id: string):                       MarketResearch | null
  peekMarketActivity?(id: string, count?: number):       MarketActivityEvent[] | null
}

// ─── Consensus ─────────────────────────────────────────────────────────────────

export interface IConsensusService {
  getMarketConsensus(id: string):                              Promise<ApiResult<ConsensusState>>
  getGlobalConsensus():                                        Promise<ApiResult<GlobalConsensusState>>
  getConsensusHistory(id: string, points?: number):            Promise<ApiResult<ConsensusHistoryPoint[]>>
  getConfidenceEvolution(id: string, base: number):            Promise<ApiResult<ConfidencePoint[]>>
  getHistoricalSnapshots(id: string):                          Promise<ApiResult<ConsensusSnapshot[]>>
  /** Consensus for every market, keyed by market id — used by list/grid sorting. */
  listConsensus():                                             Promise<ApiResult<Record<string, ConsensusState>>>
  /** Inst + retail score breakdown over time — for ConsensusChart. */
  getConsensusBreakdownHistory(id: string, range?: TimeRange): Promise<ApiResult<ConsensusBreakdownPoint[]>>
  peekConsensus?(id: string):                                  ConsensusState | null
  peekGlobal?():                                               GlobalConsensusState | null
  peekConsensusMap?():                                         Record<string, ConsensusState> | null
  peekConsensusHistory?(id: string, points?: number):          ConsensusHistoryPoint[] | null
  peekConsensusBreakdownHistory?(id: string, range?: TimeRange): ConsensusBreakdownPoint[] | null
}

// ─── Portfolio ─────────────────────────────────────────────────────────────────

export interface IPortfolioService {
  getSummary():                                   Promise<ApiResult<PortfolioSummary>>
  getAllocation():                                 Promise<ApiResult<AllocationSlice[]>>
  listPositions(scope?: PositionScope):           Promise<ApiResult<Position[]>>
  getPerformance(days?: number):                  Promise<ApiResult<PerformancePoint[]>>
  getWinRateHistory():                            Promise<ApiResult<WinRatePoint[]>>
  getActivity(limit?: number):                    Promise<ApiResult<PortfolioActivityEvent[]>>
  peekSummary?():                                 PortfolioSummary | null
  peekPositions?(scope?: PositionScope):          Position[] | null
  peekAllocation?():                              AllocationSlice[] | null
  peekPerformance?(days?: number):                PerformancePoint[] | null
  peekWinRateHistory?():                          WinRatePoint[] | null
  peekActivity?(limit?: number):                  PortfolioActivityEvent[] | null
}

// ─── Research ──────────────────────────────────────────────────────────────────

export interface IResearchService {
  listReports(filters?: ResearchFilters):         Promise<ApiResult<PaginatedResponse<ResearchReport>>>
  getReport(id: string):                          Promise<ApiResult<ResearchReport>>
  listCategories():                               Promise<ApiResult<ResearchCategory[]>>
  peekReports?(filters?: ResearchFilters):        PaginatedResponse<ResearchReport> | null
  peekReport?(id: string):                        ResearchReport | null
}

// ─── Analytics ─────────────────────────────────────────────────────────────────

export interface IAnalyticsService {
  getDashboard():                                 Promise<ApiResult<AnalyticsDashboard>>
  getConsensusAccuracy():                         Promise<ApiResult<ConsensusAccuracyPoint[]>>
  getConsensusStrengthHistory():                  Promise<ApiResult<ConsensusStrengthPoint[]>>
  getConfidenceTrendHistory():                    Promise<ApiResult<ConfidenceTrendPoint[]>>
  getETFFlows():                                  Promise<ApiResult<ETFFlowPoint[]>>
  getInstitutionalFlowHistory():                  Promise<ApiResult<InstitutionalFlowPoint[]>>
  getMarketActivityHistory():                     Promise<ApiResult<MarketActivityPoint[]>>
  getOnChainHistory(metricId: string):            Promise<ApiResult<OnChainMetricPoint[]>>
  getOnChainSnapshots():                          Promise<ApiResult<Record<string, OnChainMetricPoint>>>
  getSegmentPerformance():                        Promise<ApiResult<SegmentPerformanceRecord[]>>
  getSignalPerformance():                         Promise<ApiResult<SignalPerformanceRecord[]>>
  getConsensusSummary():                          Promise<ApiResult<ConsensusAnalyticsSummary>>
  getInstitutionalSummary():                      Promise<ApiResult<InstitutionalFlowSummary>>
  getETFSummary():                                Promise<ApiResult<ETFAnalyticsSummary>>
  getOnChainSummary():                            Promise<ApiResult<OnChainSummary>>
  getPortfolioAnalyticsSummary():                 Promise<ApiResult<PortfolioAnalyticsSummary>>
  peekDashboard?():                               AnalyticsDashboard | null
  peekConsensusAccuracy?():                       ConsensusAccuracyPoint[] | null
  peekConsensusStrengthHistory?():                ConsensusStrengthPoint[] | null
  peekConfidenceTrendHistory?():                  ConfidenceTrendPoint[] | null
  peekETFFlows?():                                ETFFlowPoint[] | null
  peekInstitutionalFlowHistory?():                InstitutionalFlowPoint[] | null
  peekMarketActivityHistory?():                   MarketActivityPoint[] | null
  peekOnChainHistory?(metricId: string):          OnChainMetricPoint[] | null
  peekOnChainSnapshots?():                        Record<string, OnChainMetricPoint> | null
  peekSegmentPerformance?():                      SegmentPerformanceRecord[] | null
  peekSignalPerformance?():                       SignalPerformanceRecord[] | null
  peekConsensusSummary?():                        ConsensusAnalyticsSummary | null
  peekInstitutionalSummary?():                    InstitutionalFlowSummary | null
  peekETFSummary?():                              ETFAnalyticsSummary | null
  peekOnChainSummary?():                          OnChainSummary | null
  peekPortfolioAnalyticsSummary?():               PortfolioAnalyticsSummary | null
}

// ─── Wallet ────────────────────────────────────────────────────────────────────

export interface IWalletService {
  getBalance():                                   Promise<ApiResult<WalletBalance>>
  getConnection():                                Promise<ApiResult<WalletConnection>>
  listTransactions():                             Promise<ApiResult<Transaction[]>>
  getPendingFunds():                              Promise<ApiResult<PendingFunds>>
  peekBalance?():                                 WalletBalance | null
  peekConnection?():                              WalletConnection | null
  peekTransactions?():                            Transaction[] | null
  peekPendingFunds?():                            PendingFunds | null
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

// ─── Admin ─────────────────────────────────────────────────────────────────────

export interface IAdminService {
  getKPIs():                   Promise<ApiResult<AdminKPIs>>
  listUsers():                 Promise<ApiResult<AdminUser[]>>
  listAdminMarkets():          Promise<ApiResult<AdminMarket[]>>
  getAuditLog():               Promise<ApiResult<AuditEntry[]>>
  getKYCQueue():               Promise<ApiResult<KYCApplication[]>>
  getSystemHealth():           Promise<ApiResult<SystemHealth>>
  getRiskDashboard():          Promise<ApiResult<RiskDashboard>>
  peekKPIs?():                 AdminKPIs | null
  peekUsers?():                AdminUser[] | null
  peekAdminMarkets?():         AdminMarket[] | null
  peekAuditLog?():             AuditEntry[] | null
  peekKYCQueue?():             KYCApplication[] | null
  peekSystemHealth?():         SystemHealth | null
  peekRiskDashboard?():        RiskDashboard | null
}

// ─── Settings ──────────────────────────────────────────────────────────────────

export interface ISettingsService {
  getSessions():   Promise<ApiResult<DeviceSession[]>>
  peekSessions?(): DeviceSession[] | null
}

// ─── Engine ────────────────────────────────────────────────────────────────────
// Operational endpoints confirmed against the Postman collection.
// /health is served at the host root (not under /api) — its live implementation
// uses apiGetHost(); all others use apiGet() against the /api base.

export interface IEngineService {
  getHealth():          Promise<ApiResult<EngineHealth>>
  getRuntime():         Promise<ApiResult<EngineRuntime>>
  getStats():           Promise<ApiResult<EngineStats>>
  getConfig():          Promise<ApiResult<EngineConfig>>
  getSurvival():        Promise<ApiResult<SurvivalStatus>>
  getPriceHistory():    Promise<ApiResult<PriceHistory>>
  getMarkets():         Promise<ApiResult<EngineMarkets>>
  getPositions():       Promise<ApiResult<EnginePositions>>
  getEvents():          Promise<ApiResult<EngineEvents>>
  getEdges():           Promise<ApiResult<EngineEdges>>
  peekHealth?():        EngineHealth | null
  peekRuntime?():       EngineRuntime | null
  peekStats?():         EngineStats | null
  peekConfig?():        EngineConfig | null
  peekSurvival?():      SurvivalStatus | null
  peekPriceHistory?():  PriceHistory | null
  peekMarkets?():       EngineMarkets | null
  peekPositions?():     EnginePositions | null
  peekEvents?():        EngineEvents | null
  peekEdges?():         EngineEdges | null
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
  admin:         IAdminService
  settings:      ISettingsService
  engine:        IEngineService
}
