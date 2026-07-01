'use client'

// Each hook returns a ServiceState<T> ({ status, data, error }) covering all
// four UI states. In mock mode the synchronous `peek*` snapshot seeds the very
// first render, so there is NO loading flash and existing screens render
// identically. When a live backend has no snapshot, the same hook surfaces
// 'loading' → 'success' | 'empty' | 'error'.

import { useCallback, useEffect, useMemo, useState, type DependencyList } from 'react'
import { services } from '@/lib/services'
import {
  ok, toServiceState, loadingState, errorState, toServiceError,
  type ServiceState, type ApiResult,
} from '@/lib/services/response'
import type { PositionScope } from '@/lib/services/interfaces'
import { getPositionAlignment, type PositionConsensus } from '@/lib/positions/alignment'
import type { MarketFilters, TimeRange } from '@/types/market'
import type { ResearchFilters } from '@/types/research'
import type { Position } from '@/types/wallet'
import type { SystemHealth, RiskDashboard } from '@/types/admin'
import { env } from '@/config/env'
import { engineHealthToSystemHealth } from '@/lib/mappers/engine'
import { survivalToRiskDashboard }    from '@/lib/mappers/admin'
import { toBotPnLView, type BotPnLView }                        from '@/lib/mappers/analytics'
import { toBtcPriceChart, type BtcPriceChartViewModel }           from '@/lib/mappers/priceHistory'
import { toEnginePortfolio, type EnginePortfolioViewModel }        from '@/lib/mappers/portfolio'
import { useApplicationStore } from '@/store/applicationStore'

function useServiceQuery<T>(
  fetcher: () => Promise<ApiResult<T>>,
  seed:    () => T | null,
  deps:    DependencyList,
): ServiceState<T> {
  const [state, setState] = useState<ServiceState<T>>(() => {
    const s = seed()
    return s !== null ? toServiceState(ok(s)) : loadingState<T>()
  })

  useEffect(() => {
    let active = true
    const s = seed()
    setState(s !== null ? toServiceState(ok(s)) : loadingState<T>())
    fetcher()
      .then((r) => { if (active) setState(toServiceState(r)) })
      .catch((e) => { if (active) setState(errorState<T>(toServiceError(e))) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

// ─── Domain hooks ───────────────────────────────────────────────────────────

export function useMarkets(filters?: MarketFilters) {
  const key = filters ? `${filters.segment ?? ''}|${filters.search ?? ''}|${filters.sortBy ?? ''}` : ''
  return useServiceQuery(
    () => services.markets.listMarkets(filters),
    () => services.markets.peekMarkets?.(filters) ?? null,
    [key],
  )
}

export function useMarket(id: string) {
  return useServiceQuery(
    () => services.markets.getMarket(id),
    () => services.markets.peekMarket?.(id) ?? null,
    [id],
  )
}

export function useMarketHistory(id: string, range: TimeRange = '7d') {
  return useServiceQuery(
    () => services.markets.getMarketHistory(id, range),
    () => services.markets.peekMarketHistory?.(id, range) ?? null,
    [id, range],
  )
}

export function useVolumeHistory(id: string, range: TimeRange = '7d') {
  return useServiceQuery(
    () => services.markets.getVolumeHistory(id, range),
    () => services.markets.peekVolumeHistory?.(id, range) ?? null,
    [id, range],
  )
}

export function useConsensusBreakdownHistory(id: string, range: TimeRange = '7d') {
  return useServiceQuery(
    () => services.consensus.getConsensusBreakdownHistory(id, range),
    () => services.consensus.peekConsensusBreakdownHistory?.(id, range) ?? null,
    [id, range],
  )
}

export function useMarketConsensus(id: string) {
  return useServiceQuery(
    () => services.consensus.getMarketConsensus(id),
    () => services.consensus.peekConsensus?.(id) ?? null,
    [id],
  )
}

export function useGlobalConsensus() {
  return useServiceQuery(
    () => services.consensus.getGlobalConsensus(),
    () => services.consensus.peekGlobal?.() ?? null,
    [],
  )
}

export function useConsensusMap() {
  return useServiceQuery(
    () => services.consensus.listConsensus(),
    () => services.consensus.peekConsensusMap?.() ?? null,
    [],
  )
}

/**
 * Returns a stable `(position) => { consensus, alignment }` function bound to the
 * current consensus map (from the service registry). Lets list/row components
 * compute alignment per position without a hook call per row.
 */
export function usePositionConsensus(): (position: Position) => PositionConsensus {
  const consensusMap = useConsensusMap().data ?? {}
  return useCallback(
    (position: Position) => getPositionAlignment(position, consensusMap),
    [consensusMap],
  )
}

export function usePortfolioSummary() {
  return useServiceQuery(
    () => services.portfolio.getSummary(),
    () => services.portfolio.peekSummary?.() ?? null,
    [],
  )
}

export function usePositions(scope: PositionScope = 'all') {
  return useServiceQuery(
    () => services.portfolio.listPositions(scope),
    () => services.portfolio.peekPositions?.(scope) ?? null,
    [scope],
  )
}

export function useResearchReports(filters?: ResearchFilters) {
  const key = filters ? `${filters.categoryId ?? ''}|${filters.search ?? ''}` : ''
  return useServiceQuery(
    () => services.research.listReports(filters),
    () => services.research.peekReports?.(filters) ?? null,
    [key],
  )
}

export function useResearchReport(id: string) {
  return useServiceQuery(
    () => services.research.getReport(id),
    () => services.research.peekReport?.(id) ?? null,
    [id],
  )
}

export function useAnalyticsDashboard() {
  return useServiceQuery(
    () => services.analytics.getDashboard(),
    () => services.analytics.peekDashboard?.() ?? null,
    [],
  )
}

export function useConsensusAccuracyHistory() {
  return useServiceQuery(
    () => services.analytics.getConsensusAccuracy(),
    () => services.analytics.peekConsensusAccuracy?.() ?? null,
    [],
  )
}

export function useConsensusStrengthHistory() {
  return useServiceQuery(
    () => services.analytics.getConsensusStrengthHistory(),
    () => services.analytics.peekConsensusStrengthHistory?.() ?? null,
    [],
  )
}

export function useConfidenceTrendHistory() {
  return useServiceQuery(
    () => services.analytics.getConfidenceTrendHistory(),
    () => services.analytics.peekConfidenceTrendHistory?.() ?? null,
    [],
  )
}

export function useETFFlowHistory() {
  return useServiceQuery(
    () => services.analytics.getETFFlows(),
    () => services.analytics.peekETFFlows?.() ?? null,
    [],
  )
}

export function useInstitutionalFlowHistory() {
  return useServiceQuery(
    () => services.analytics.getInstitutionalFlowHistory(),
    () => services.analytics.peekInstitutionalFlowHistory?.() ?? null,
    [],
  )
}

export function useMarketActivityHistory() {
  return useServiceQuery(
    () => services.analytics.getMarketActivityHistory(),
    () => services.analytics.peekMarketActivityHistory?.() ?? null,
    [],
  )
}

export function useOnChainHistory(metricId: string) {
  return useServiceQuery(
    () => services.analytics.getOnChainHistory(metricId),
    () => services.analytics.peekOnChainHistory?.(metricId) ?? null,
    [metricId],
  )
}

export function useOnChainSnapshots() {
  return useServiceQuery(
    () => services.analytics.getOnChainSnapshots(),
    () => services.analytics.peekOnChainSnapshots?.() ?? null,
    [],
  )
}

export function useSegmentAnalytics() {
  return useServiceQuery(
    () => services.analytics.getSegmentPerformance(),
    () => services.analytics.peekSegmentPerformance?.() ?? null,
    [],
  )
}

export function useSignalPerformance() {
  return useServiceQuery(
    () => services.analytics.getSignalPerformance(),
    () => services.analytics.peekSignalPerformance?.() ?? null,
    [],
  )
}

export function useConsensusSummary() {
  return useServiceQuery(
    () => services.analytics.getConsensusSummary(),
    () => services.analytics.peekConsensusSummary?.() ?? null,
    [],
  )
}

export function useInstitutionalSummary() {
  return useServiceQuery(
    () => services.analytics.getInstitutionalSummary(),
    () => services.analytics.peekInstitutionalSummary?.() ?? null,
    [],
  )
}

export function useETFSummary() {
  return useServiceQuery(
    () => services.analytics.getETFSummary(),
    () => services.analytics.peekETFSummary?.() ?? null,
    [],
  )
}

export function useOnChainSummary() {
  return useServiceQuery(
    () => services.analytics.getOnChainSummary(),
    () => services.analytics.peekOnChainSummary?.() ?? null,
    [],
  )
}

export function usePortfolioAnalyticsSummary() {
  return useServiceQuery(
    () => services.analytics.getPortfolioAnalyticsSummary(),
    () => services.analytics.peekPortfolioAnalyticsSummary?.() ?? null,
    [],
  )
}

export function usePortfolioAllocation() {
  return useServiceQuery(
    () => services.portfolio.getAllocation(),
    () => services.portfolio.peekAllocation?.() ?? null,
    [],
  )
}

export function usePortfolioPerformance(days = 30) {
  return useServiceQuery(
    () => services.portfolio.getPerformance(days),
    () => services.portfolio.peekPerformance?.(days) ?? null,
    [days],
  )
}

export function useWinRateHistory() {
  return useServiceQuery(
    () => services.portfolio.getWinRateHistory(),
    () => services.portfolio.peekWinRateHistory?.() ?? null,
    [],
  )
}

export function usePortfolioActivity(limit?: number) {
  return useServiceQuery(
    () => services.portfolio.getActivity(limit),
    () => services.portfolio.peekActivity?.(limit) ?? null,
    [limit ?? 0],
  )
}

export function useWalletBalance() {
  return useServiceQuery(
    () => services.wallet.getBalance(),
    () => services.wallet.peekBalance?.() ?? null,
    [],
  )
}

export function useWalletConnection() {
  return useServiceQuery(
    () => services.wallet.getConnection(),
    () => services.wallet.peekConnection?.() ?? null,
    [],
  )
}

export function useTransactions() {
  return useServiceQuery(
    () => services.wallet.listTransactions(),
    () => services.wallet.peekTransactions?.() ?? null,
    [],
  )
}

export function useWalletPendingFunds() {
  return useServiceQuery(
    () => services.wallet.getPendingFunds(),
    () => services.wallet.peekPendingFunds?.() ?? null,
    [],
  )
}

export function useNotificationItems() {
  return useServiceQuery(
    () => services.notifications.list(),
    () => services.notifications.peek?.() ?? null,
    [],
  )
}

export function useActivity(limit?: number) {
  return useServiceQuery(
    () => services.activity.list(limit),
    () => services.activity.peek?.(limit) ?? null,
    [limit ?? 0],
  )
}

// ─── Consensus history ────────────────────────────────────────────────────────

export function useConsensusHistory(marketId: string, points = 30) {
  return useServiceQuery(
    () => services.consensus.getConsensusHistory(marketId, points),
    () => services.consensus.peekConsensusHistory?.(marketId, points) ?? null,
    [marketId, points],
  )
}

// ─── Market detail ────────────────────────────────────────────────────────────

export function useRelatedMarkets(marketId: string) {
  return useServiceQuery(
    () => services.markets.getRelatedMarkets(marketId),
    () => services.markets.peekRelatedMarkets?.(marketId) ?? null,
    [marketId],
  )
}

export function useMarketResearch(marketId: string) {
  return useServiceQuery(
    () => services.markets.getMarketResearch(marketId),
    () => services.markets.peekMarketResearch?.(marketId) ?? null,
    [marketId],
  )
}

export function useMarketActivity(marketId: string, count = 20) {
  return useServiceQuery(
    () => services.markets.getMarketActivity(marketId, count),
    () => services.markets.peekMarketActivity?.(marketId, count) ?? null,
    [marketId, count],
  )
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useAdminKPIs() {
  return useServiceQuery(
    () => services.admin.getKPIs(),
    () => services.admin.peekKPIs?.() ?? null,
    [],
  )
}

export function useAdminUsers() {
  return useServiceQuery(
    () => services.admin.listUsers(),
    () => services.admin.peekUsers?.() ?? null,
    [],
  )
}

export function useAdminMarkets() {
  return useServiceQuery(
    () => services.admin.listAdminMarkets(),
    () => services.admin.peekAdminMarkets?.() ?? null,
    [],
  )
}

export function useAuditLog() {
  return useServiceQuery(
    () => services.admin.getAuditLog(),
    () => services.admin.peekAuditLog?.() ?? null,
    [],
  )
}

export function useKYCQueue() {
  return useServiceQuery(
    () => services.admin.getKYCQueue(),
    () => services.admin.peekKYCQueue?.() ?? null,
    [],
  )
}

export function useSystemHealth(): ServiceState<SystemHealth> {
  // Reads engine.health from ApplicationStore (populated by ApplicationStateLoader).
  // The admin mock query still fires so mock mode works without any store data.
  const healthSlice = useApplicationStore((s) => s.engine.health)
  const adminState  = useServiceQuery(
    () => services.admin.getSystemHealth(),
    () => services.admin.peekSystemHealth?.() ?? null,
    [],
  )
  return useMemo<ServiceState<SystemHealth>>(() => {
    if (env.API_MODE !== 'live') return adminState
    if (healthSlice.status !== 'success') return { status: healthSlice.status, data: null, error: healthSlice.error }
    if (!healthSlice.data)                return { status: 'empty', data: null, error: null }
    return { status: 'success', data: engineHealthToSystemHealth(healthSlice.data), error: null }
  }, [healthSlice, adminState])
}

export function useRiskDashboard(): ServiceState<RiskDashboard> {
  // Survival is primary; runtime adds the Total P&L metric row when available.
  // Both read from ApplicationStore — no additional fetches.
  const survivalSlice = useApplicationStore((s) => s.engine.survival)
  const runtimeSlice  = useApplicationStore((s) => s.engine.runtime)
  const adminState    = useServiceQuery(
    () => services.admin.getRiskDashboard(),
    () => services.admin.peekRiskDashboard?.() ?? null,
    [],
  )
  return useMemo<ServiceState<RiskDashboard>>(() => {
    if (env.API_MODE !== 'live') return adminState
    if (survivalSlice.status !== 'success') return { status: survivalSlice.status, data: null, error: survivalSlice.error }
    if (!survivalSlice.data)                return { status: 'empty', data: null, error: null }
    return {
      status: 'success',
      data:   survivalToRiskDashboard(survivalSlice.data, runtimeSlice.data ?? null),
      error:  null,
    }
  }, [survivalSlice, runtimeSlice, adminState])
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function useSessions() {
  return useServiceQuery(
    () => services.settings.getSessions(),
    () => services.settings.peekSessions?.() ?? null,
    [],
  )
}

// ─── Engine ───────────────────────────────────────────────────────────────────
// LiveEngineService has no peek* methods — live mode starts as 'loading' then
// resolves to 'success'. MockEngineService returns peek* data synchronously so
// the mock UI renders without a loading flash.

export function useEngineHealth() {
  return useServiceQuery(
    () => services.engine.getHealth(),
    () => services.engine.peekHealth?.() ?? null,
    [],
  )
}

export function useEngineStats() {
  return useServiceQuery(
    () => services.engine.getStats(),
    () => services.engine.peekStats?.() ?? null,
    [],
  )
}

export function useEngineRuntime() {
  return useServiceQuery(
    () => services.engine.getRuntime(),
    () => services.engine.peekRuntime?.() ?? null,
    [],
  )
}

export function useEngineConfig() {
  return useServiceQuery(
    () => services.engine.getConfig(),
    () => services.engine.peekConfig?.() ?? null,
    [],
  )
}

export function useEngineSurvival() {
  return useServiceQuery(
    () => services.engine.getSurvival(),
    () => services.engine.peekSurvival?.() ?? null,
    [],
  )
}

export function useEnginePriceHistory() {
  return useServiceQuery(
    () => services.engine.getPriceHistory(),
    () => services.engine.peekPriceHistory?.() ?? null,
    [],
  )
}

export function useEngineMarkets() {
  return useServiceQuery(
    () => services.engine.getMarkets(),
    () => services.engine.peekMarkets?.() ?? null,
    [],
  )
}

export function useEnginePositions() {
  return useServiceQuery(
    () => services.engine.getPositions(),
    () => services.engine.peekPositions?.() ?? null,
    [],
  )
}

export function useEngineEvents() {
  return useServiceQuery(
    () => services.engine.getEvents(),
    () => services.engine.peekEvents?.() ?? null,
    [],
  )
}

export function useEngineEdges() {
  return useServiceQuery(
    () => services.engine.getEdges(),
    () => services.engine.peekEdges?.() ?? null,
    [],
  )
}

// ─── Engine composite hooks (mapped UI models) ────────────────────────────────

/**
 * Maps /api/price-history from ApplicationStore into a chart-ready ViewModel.
 * Provides current price, OHLC-style range, change delta, and typed point array.
 */
export function useEnginePriceChart(): ServiceState<BtcPriceChartViewModel> {
  const priceSlice = useApplicationStore((s) => s.engine.priceHistory)
  return useMemo<ServiceState<BtcPriceChartViewModel>>(() => {
    if (priceSlice.status !== 'success') return { status: priceSlice.status, data: null, error: priceSlice.error }
    if (!priceSlice.data)               return { status: 'empty', data: null, error: null }
    return { status: 'success', data: toBtcPriceChart(priceSlice.data), error: null }
  }, [priceSlice])
}

/**
 * Maps /api/survival + /api/runtime from ApplicationStore into a bot-centric
 * portfolio ViewModel (capital, P&L, targets, risk state, trading activity).
 * Distinct from the prediction-market PortfolioSummary — no win rate or
 * consensus fields, because the engine does not provide them today.
 */
export function useEnginePortfolio(): ServiceState<EnginePortfolioViewModel> {
  const survivalSlice = useApplicationStore((s) => s.engine.survival)
  const runtimeSlice  = useApplicationStore((s) => s.engine.runtime)
  return useMemo<ServiceState<EnginePortfolioViewModel>>(() => {
    if (survivalSlice.status !== 'success') return { status: survivalSlice.status, data: null, error: survivalSlice.error }
    if (!survivalSlice.data)               return { status: 'empty', data: null, error: null }
    return {
      status: 'success',
      data:   toEnginePortfolio(survivalSlice.data, runtimeSlice.data ?? null),
      error:  null,
    }
  }, [survivalSlice, runtimeSlice])
}

/**
 * Combines survival + runtime slices from ApplicationStore into a BotPnLView
 * ready for any component that displays bot performance (P&L, capital, state).
 * Survival is primary; runtime adds order/edge counts and totalPnl.
 */
export function useEngineBotStatus(): ServiceState<BotPnLView> {
  const survivalSlice = useApplicationStore((s) => s.engine.survival)
  const runtimeSlice  = useApplicationStore((s) => s.engine.runtime)
  return useMemo<ServiceState<BotPnLView>>(() => {
    if (survivalSlice.status !== 'success') return { status: survivalSlice.status, data: null, error: survivalSlice.error }
    if (!survivalSlice.data)                return { status: 'empty', data: null, error: null }
    return {
      status: 'success',
      data:   toBotPnLView(survivalSlice.data, runtimeSlice.data ?? null),
      error:  null,
    }
  }, [survivalSlice, runtimeSlice])
}
