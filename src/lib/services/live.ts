// Template for the backend integration: fetch JSON DTOs from the Probex API,
// normalize via the dto.ts adapters, and return the standard ApiResult. The
// other seven services follow this exact shape. Not wired into the registry
// yet — flip NEXT_PUBLIC_API_MODE=live and register these once endpoints exist.

import { env } from '@/config/env'
import { ok, ServiceException, type ApiResult, type PaginatedResponse } from './response'
import type { IMarketsService } from './interfaces'
import { toMarket, type MarketDTO } from './dto'
import type { Market, MarketFilters, BitcoinSegment } from '@/types/market'

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${env.API_BASE_URL}${path}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new ServiceException(
      res.status === 404 ? 'NOT_FOUND' : res.status === 401 ? 'UNAUTHORIZED' : 'HTTP_ERROR',
      `GET ${path} → ${res.status}`,
      res.status >= 500,
    )
  }
  return res.json() as Promise<T>
}

interface MarketListDTO {
  items:   MarketDTO[]
  total:   number
  cursor:  string | null
  hasMore: boolean
}

export class LiveMarketsService implements IMarketsService {
  async listMarkets(filters?: MarketFilters): Promise<ApiResult<PaginatedResponse<Market>>> {
    const qs = new URLSearchParams()
    if (filters?.segment) qs.set('segment', filters.segment)
    if (filters?.search)  qs.set('search', filters.search)
    const dto = await apiGet<MarketListDTO>(`/v1/markets?${qs.toString()}`)
    return ok({ data: dto.items.map(toMarket), total: dto.total, cursor: dto.cursor, hasMore: dto.hasMore })
  }

  async getMarket(id: string): Promise<ApiResult<Market>> {
    const dto = await apiGet<MarketDTO>(`/v1/markets/${id}`)
    return ok(toMarket(dto))
  }

  async getBySegment(segment: BitcoinSegment): Promise<ApiResult<Market[]>> {
    const dto = await apiGet<MarketListDTO>(`/v1/markets?segment=${segment}`)
    return ok(dto.items.map(toMarket))
  }
  // No peek* — a live service has no synchronous snapshot, so hooks correctly
  // surface 'loading' until the first response resolves.
}
