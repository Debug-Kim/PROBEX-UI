// Template for the backend integration: fetch JSON DTOs via the shared API client,
// normalize via the dto.ts adapters, and return the standard ApiResult. Paths come
// from the central endpoint registry — these routes are still placeholders, so the
// calls raise ENDPOINT_NOT_CONFIGURED until the backend confirms them.
// Not wired into the registry yet — flip NEXT_PUBLIC_API_MODE=live once ready.

import { ok, type ApiResult, type PaginatedResponse } from './response'
import type {
  IMarketsService, IPortfolioService, IResearchService, IAnalyticsService,
  IAdminService, ISettingsService,
  MarketHistoryPoint, VolumeHistoryPoint, PositionScope,
} from './interfaces'
import type { AdminKPIs, AdminUser, AdminMarket, AuditEntry, KYCApplication, SystemHealth, RiskDashboard } from '@/types/admin'
import type { DeviceSession } from '@/types/settings'
import type { MarketActivityEvent, MarketResearch, RelatedMarket } from '@/types/marketDetail'
import { toMarket, type MarketDTO } from './dto'
import { apiGet } from '@/lib/api/client'
import { ENDPOINTS, endpointPath } from '@/lib/api/endpoints'
import type { Market, MarketFilters, BitcoinSegment, TimeRange } from '@/types/market'
import type { Position } from '@/types/wallet'
import type { PortfolioSummary, AllocationSlice, PerformancePoint, WinRatePoint, PortfolioActivityEvent } from '@/types/portfolio'
import type { ResearchReport, ResearchCategory, ResearchFilters } from '@/types/research'
import type {
  AnalyticsDashboard, ConsensusAccuracyPoint, ConsensusStrengthPoint, ConfidenceTrendPoint,
  ETFFlowPoint, InstitutionalFlowPoint, MarketActivityPoint, OnChainMetricPoint,
  SegmentPerformanceRecord, SignalPerformanceRecord,
  ConsensusAnalyticsSummary, InstitutionalFlowSummary, ETFAnalyticsSummary,
  OnChainSummary, PortfolioAnalyticsSummary,
} from '@/types/analytics'

interface MarketListDTO {
  items:   MarketDTO[]
  total:   number
  cursor:  string | null
  hasMore: boolean
}

export class LiveMarketsService implements IMarketsService {
  async listMarkets(filters?: MarketFilters): Promise<ApiResult<PaginatedResponse<Market>>> {
    const path = endpointPath(ENDPOINTS.markets.list)
    const params: Record<string, string> = {}
    if (filters?.segment) params.segment = filters.segment
    if (filters?.search)  params.search = filters.search
    const dto = await apiGet<MarketListDTO>(path, params)
    return ok({ data: dto.items.map(toMarket), total: dto.total, cursor: dto.cursor, hasMore: dto.hasMore })
  }

  async getMarket(id: string): Promise<ApiResult<Market>> {
    const path = endpointPath(ENDPOINTS.markets.list)
    const dto = await apiGet<MarketDTO>(`${path}/${id}`)
    return ok(toMarket(dto))
  }

  async getBySegment(segment: BitcoinSegment): Promise<ApiResult<Market[]>> {
    const path = endpointPath(ENDPOINTS.markets.list)
    const dto = await apiGet<MarketListDTO>(path, { segment })
    return ok(dto.items.map(toMarket))
  }

  async getMarketHistory(id: string, range: TimeRange = '7d'): Promise<ApiResult<MarketHistoryPoint[]>> {
    const path = endpointPath(ENDPOINTS.markets.history)
    const dto = await apiGet<MarketHistoryPoint[]>(`${path}/${id}`, { range })
    return ok(dto)
  }

  async getVolumeHistory(id: string, range: TimeRange = '7d'): Promise<ApiResult<VolumeHistoryPoint[]>> {
    const path = endpointPath(ENDPOINTS.markets.volume)
    const dto = await apiGet<VolumeHistoryPoint[]>(`${path}/${id}`, { range })
    return ok(dto)
  }
  async getRelatedMarkets(id: string): Promise<ApiResult<RelatedMarket[]>> {
    const path = endpointPath(ENDPOINTS.markets.related)
    return ok(await apiGet<RelatedMarket[]>(`${path}/${id}`))
  }
  async getMarketResearch(id: string): Promise<ApiResult<MarketResearch>> {
    const path = endpointPath(ENDPOINTS.markets.research)
    return ok(await apiGet<MarketResearch>(`${path}/${id}`))
  }
  async getMarketActivity(id: string, count?: number): Promise<ApiResult<MarketActivityEvent[]>> {
    const path = endpointPath(ENDPOINTS.markets.activity)
    return ok(await apiGet<MarketActivityEvent[]>(`${path}/${id}`, count !== undefined ? { count } : undefined))
  }
  // No peek* — live has no synchronous snapshot.
}

export class LivePortfolioService implements IPortfolioService {
  async getSummary(): Promise<ApiResult<PortfolioSummary>> {
    const path = endpointPath(ENDPOINTS.portfolio.summary)
    return ok(await apiGet<PortfolioSummary>(path))
  }

  async getAllocation(): Promise<ApiResult<AllocationSlice[]>> {
    const path = endpointPath(ENDPOINTS.portfolio.allocation)
    return ok(await apiGet<AllocationSlice[]>(path))
  }

  async listPositions(scope: PositionScope = 'all'): Promise<ApiResult<Position[]>> {
    const path = endpointPath(ENDPOINTS.positions.list)
    return ok(await apiGet<Position[]>(path, { scope }))
  }

  async getPerformance(days = 30): Promise<ApiResult<PerformancePoint[]>> {
    const path = endpointPath(ENDPOINTS.portfolio.performance)
    return ok(await apiGet<PerformancePoint[]>(path, { days }))
  }

  async getWinRateHistory(): Promise<ApiResult<WinRatePoint[]>> {
    const path = endpointPath(ENDPOINTS.portfolio.winRate)
    return ok(await apiGet<WinRatePoint[]>(path))
  }

  async getActivity(limit?: number): Promise<ApiResult<PortfolioActivityEvent[]>> {
    const path = endpointPath(ENDPOINTS.portfolio.activity)
    return ok(await apiGet<PortfolioActivityEvent[]>(path, limit !== undefined ? { limit } : undefined))
  }
  // No peek* — live has no synchronous snapshot.
}

export class LiveResearchService implements IResearchService {
  async listReports(filters?: ResearchFilters): Promise<ApiResult<PaginatedResponse<ResearchReport>>> {
    const path = endpointPath(ENDPOINTS.research.list)
    const params: Record<string, string> = {}
    if (filters?.categoryId) params.categoryId = filters.categoryId
    if (filters?.search)     params.search     = filters.search
    return ok(await apiGet<PaginatedResponse<ResearchReport>>(path, params))
  }
  async getReport(id: string): Promise<ApiResult<ResearchReport>> {
    const path = endpointPath(ENDPOINTS.research.get)
    return ok(await apiGet<ResearchReport>(`${path}/${id}`))
  }
  async listCategories(): Promise<ApiResult<ResearchCategory[]>> {
    const path = endpointPath(ENDPOINTS.research.categories)
    return ok(await apiGet<ResearchCategory[]>(path))
  }
}

export class LiveAdminService implements IAdminService {
  async getKPIs():          Promise<ApiResult<AdminKPIs>>        { return ok(await apiGet<AdminKPIs>(endpointPath(ENDPOINTS.admin.kpis))) }
  async listUsers():        Promise<ApiResult<AdminUser[]>>       { return ok(await apiGet<AdminUser[]>(endpointPath(ENDPOINTS.admin.users))) }
  async listAdminMarkets(): Promise<ApiResult<AdminMarket[]>>     { return ok(await apiGet<AdminMarket[]>(endpointPath(ENDPOINTS.admin.adminMarkets))) }
  async getAuditLog():      Promise<ApiResult<AuditEntry[]>>      { return ok(await apiGet<AuditEntry[]>(endpointPath(ENDPOINTS.admin.auditLog))) }
  async getKYCQueue():      Promise<ApiResult<KYCApplication[]>>  { return ok(await apiGet<KYCApplication[]>(endpointPath(ENDPOINTS.admin.kycQueue))) }
  async getSystemHealth():  Promise<ApiResult<SystemHealth>>      { return ok(await apiGet<SystemHealth>(endpointPath(ENDPOINTS.admin.systemHealth))) }
  async getRiskDashboard(): Promise<ApiResult<RiskDashboard>>     { return ok(await apiGet<RiskDashboard>(endpointPath(ENDPOINTS.admin.riskDashboard))) }
}

export class LiveSettingsService implements ISettingsService {
  async getSessions(): Promise<ApiResult<DeviceSession[]>> {
    return ok(await apiGet<DeviceSession[]>(endpointPath(ENDPOINTS.settings.sessions)))
  }
}

// ─── Consensus stubs (ConfidenceEvolution + HistoricalSnapshots) ──────────────
// These are not implemented as a full LiveConsensusService since the consensus
// service is not yet wired into the live registry; they are present so the
// build knows these methods exist on the interface.

export class LiveAnalyticsService implements IAnalyticsService {
  async getDashboard(): Promise<ApiResult<AnalyticsDashboard>> {
    return ok(await apiGet<AnalyticsDashboard>(endpointPath(ENDPOINTS.analytics.dashboard)))
  }
  async getConsensusAccuracy(): Promise<ApiResult<ConsensusAccuracyPoint[]>> {
    return ok(await apiGet<ConsensusAccuracyPoint[]>(endpointPath(ENDPOINTS.analytics.consensusAccuracy)))
  }
  async getConsensusStrengthHistory(): Promise<ApiResult<ConsensusStrengthPoint[]>> {
    return ok(await apiGet<ConsensusStrengthPoint[]>(endpointPath(ENDPOINTS.analytics.consensusStrength)))
  }
  async getConfidenceTrendHistory(): Promise<ApiResult<ConfidenceTrendPoint[]>> {
    return ok(await apiGet<ConfidenceTrendPoint[]>(endpointPath(ENDPOINTS.analytics.confidenceTrend)))
  }
  async getETFFlows(): Promise<ApiResult<ETFFlowPoint[]>> {
    return ok(await apiGet<ETFFlowPoint[]>(endpointPath(ENDPOINTS.analytics.etfFlows)))
  }
  async getInstitutionalFlowHistory(): Promise<ApiResult<InstitutionalFlowPoint[]>> {
    return ok(await apiGet<InstitutionalFlowPoint[]>(endpointPath(ENDPOINTS.analytics.institutionalFlow)))
  }
  async getMarketActivityHistory(): Promise<ApiResult<MarketActivityPoint[]>> {
    return ok(await apiGet<MarketActivityPoint[]>(endpointPath(ENDPOINTS.analytics.marketActivity)))
  }
  async getOnChainHistory(metricId: string): Promise<ApiResult<OnChainMetricPoint[]>> {
    return ok(await apiGet<OnChainMetricPoint[]>(endpointPath(ENDPOINTS.analytics.onChainHistory), { metricId }))
  }
  async getOnChainSnapshots(): Promise<ApiResult<Record<string, OnChainMetricPoint>>> {
    return ok(await apiGet<Record<string, OnChainMetricPoint>>(endpointPath(ENDPOINTS.analytics.onChainSnapshots)))
  }
  async getSegmentPerformance(): Promise<ApiResult<SegmentPerformanceRecord[]>> {
    return ok(await apiGet<SegmentPerformanceRecord[]>(endpointPath(ENDPOINTS.analytics.segmentPerformance)))
  }
  async getSignalPerformance(): Promise<ApiResult<SignalPerformanceRecord[]>> {
    return ok(await apiGet<SignalPerformanceRecord[]>(endpointPath(ENDPOINTS.analytics.signalPerformance)))
  }
  async getConsensusSummary(): Promise<ApiResult<ConsensusAnalyticsSummary>> {
    return ok(await apiGet<ConsensusAnalyticsSummary>(endpointPath(ENDPOINTS.analytics.consensusSummary)))
  }
  async getInstitutionalSummary(): Promise<ApiResult<InstitutionalFlowSummary>> {
    return ok(await apiGet<InstitutionalFlowSummary>(endpointPath(ENDPOINTS.analytics.institutionalSummary)))
  }
  async getETFSummary(): Promise<ApiResult<ETFAnalyticsSummary>> {
    return ok(await apiGet<ETFAnalyticsSummary>(endpointPath(ENDPOINTS.analytics.etfSummary)))
  }
  async getOnChainSummary(): Promise<ApiResult<OnChainSummary>> {
    return ok(await apiGet<OnChainSummary>(endpointPath(ENDPOINTS.analytics.onChainSummary)))
  }
  async getPortfolioAnalyticsSummary(): Promise<ApiResult<PortfolioAnalyticsSummary>> {
    return ok(await apiGet<PortfolioAnalyticsSummary>(endpointPath(ENDPOINTS.analytics.portfolioSummary)))
  }
}
