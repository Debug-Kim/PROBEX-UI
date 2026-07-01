// ─── Engine markets mapper ────────────────────────────────────────────────────
//
// ❌ COVERAGE: /api/markets currently times out (15 s) and returns unknown[] items.
//
// This file serves two purposes:
//   1. Documents the REQUIRED wire shape (EngineMarketItemDTO) that Jake needs to
//      implement so the frontend can map it to the existing Market type with zero
//      component changes.
//   2. Provides toMarket() / toMarkets() functions ready to activate once the
//      backend begins returning populated items.
//
// When items arrive, wire into:
//   LiveEngineService.getMarkets() → adapt with toMarkets()
//   useMarkets() / useMarketStream() will pick up automatically

import type { EngineMarkets }  from '@/types/engine'
import type { Market }         from '@/types/market'
import type { MarketId }       from '@/types/branded'

// ─── Required wire schema (DTO) ───────────────────────────────────────────────
// THIS IS THE BACKEND CONTRACT.
// Jake must return this exact shape inside the markets[] array.
// All dates are ISO 8601 strings (UTC with Z suffix recommended).
// All monetary values are USD floats unless noted.

/**
 * Single market item as returned by GET /api/markets items[].
 *
 * @required Jake — the backend must produce this shape.
 */
export interface EngineMarketItemDTO {
  /** Stable unique identifier (UUID or slug). Used as React key + route param. */
  id:                  string

  /** Prediction question text — displayed as the market title. */
  title:               string

  /** Extended description / thesis for the prediction. */
  description:         string

  /** Bitcoin market segment.
   *  Must be one of: 'price-targets' | 'volatility' | 'etf-flows' |
   *  'on-chain-metrics' | 'network-health' | 'institutional-activity' |
   *  'macro-signals' | 'market-structure' */
  segment:             string

  /** Asset class. MVP value: 'bitcoin'. */
  asset_class:         string

  /** Current YES probability [0.0, 1.0]. */
  probability:         number

  /** YES price in cents [0, 100]. */
  yes_price:           number

  /** NO price in cents [0, 100]. Always 100 − yes_price. */
  no_price:            number

  /** 24-hour trading volume (USD). */
  volume_24h:          number

  /** All-time cumulative volume (USD). */
  volume_total:        number

  /** Available liquidity depth (USD). */
  liquidity:           number

  /** Total open interest (USD). */
  open_interest:       number

  /** Market lifecycle state.
   *  Must be one of: 'live' | 'paused' | 'settling' | 'resolved' | 'cancelled' */
  status:              string

  /** Directional bias inferred from consensus signals.
   *  Must be one of: 'bullish' | 'bearish' | 'neutral' */
  sentiment:           string

  /** Categorical tags for filtering/search (e.g. ['price', 'q3']). */
  tags:                string[]

  /** Plain-English resolution criteria. */
  resolution_criteria: string

  /** ISO 8601 — market closes / resolves at this time. */
  closes_at:           string

  /** ISO 8601 or null if not yet resolved. */
  resolved_at:         string | null

  /** ISO 8601 — when this market was created. */
  created_at:          string

  /** ISO 8601 — last metadata update. */
  updated_at:          string
}

/**
 * Full envelope returned by GET /api/markets.
 */
export interface EngineMarketsResponseDTO {
  markets:   EngineMarketItemDTO[]
  count:     number
  total:     number          // total available (may exceed count if paginated)
  has_more:  boolean
  cursor:    string | null   // opaque cursor for next page; null = end
  timestamp: string          // ISO 8601
}

// ─── Mapper (ready to activate) ───────────────────────────────────────────────

/** Convert a single wire DTO to the frontend Market domain type. */
export function toMarket(dto: EngineMarketItemDTO): Market {
  return {
    id:                 dto.id              as MarketId,
    assetClass:         dto.asset_class     as Market['assetClass'],
    segment:            dto.segment         as Market['segment'],
    title:              dto.title,
    question:           dto.title,          // alias
    description:        dto.description,
    probability:        dto.probability,
    yesPrice:           dto.yes_price,
    noPrice:            dto.no_price,
    volume:             dto.volume_24h,
    volume24h:          dto.volume_24h,
    volumeTotal:        dto.volume_total,
    liquidity:          dto.liquidity,
    openInterest:       dto.open_interest,
    status:             dto.status          as Market['status'],
    sentiment:          dto.sentiment       as Market['sentiment'],
    resolutionDate:     dto.closes_at,
    closesAt:           dto.closes_at,
    resolvedAt:         dto.resolved_at,
    resolutionCriteria: dto.resolution_criteria,
    tags:               dto.tags,
    createdAt:          dto.created_at,
    updatedAt:          dto.updated_at,
  }
}

/** Convert a populated markets envelope to a Market[]. */
export function toMarkets(m: EngineMarkets): Market[] {
  return (m.markets as EngineMarketItemDTO[]).map(toMarket)
}

// ─── Envelope-only helpers (available today) ─────────────────────────────────

/** Returns the raw market count from the envelope (works even when items are []). */
export function engineMarketsCount(m: EngineMarkets): number {
  return m.count
}
