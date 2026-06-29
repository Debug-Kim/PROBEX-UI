'use client'

// Each hook returns a ServiceState<T> ({ status, data, error }) covering all
// four UI states. In mock mode the synchronous `peek*` snapshot seeds the very
// first render, so there is NO loading flash and existing screens render
// identically. When a live backend has no snapshot, the same hook surfaces
// 'loading' → 'success' | 'empty' | 'error'.

import { useEffect, useState, type DependencyList } from 'react'
import { services } from '@/lib/services'
import {
  ok, toServiceState, loadingState, errorState, toServiceError,
  type ServiceState, type ApiResult,
} from '@/lib/services/response'
import type { PositionScope } from '@/lib/services/interfaces'
import type { MarketFilters } from '@/types/market'
import type { ResearchFilters } from '@/types/research'

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

export function useAnalyticsDashboard() {
  return useServiceQuery(
    () => services.analytics.getDashboard(),
    () => services.analytics.peekDashboard?.() ?? null,
    [],
  )
}

export function useWalletBalance() {
  return useServiceQuery(
    () => services.wallet.getBalance(),
    () => services.wallet.peekBalance?.() ?? null,
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
