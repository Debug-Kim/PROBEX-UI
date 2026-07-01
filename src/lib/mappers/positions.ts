// ─── Engine positions mapper ──────────────────────────────────────────────────
//
// 🟡 COVERAGE: /api/positions envelope works; items[] are currently unknown[].
//
// This file serves two purposes:
//   1. Documents the REQUIRED wire shape (EnginePositionItemDTO) that Jake needs
//      to implement so the frontend can populate the existing Position type with
//      zero component changes.
//   2. Provides toPosition() / toPositions() functions ready to activate once
//      the backend begins returning populated items.
//
// When items arrive, wire into:
//   LiveEngineService.getPositions() → adapt with toPositions()
//   usePositions() will pick up automatically

import type { EnginePositions } from '@/types/engine'
import type { Position }        from '@/types/wallet'
import type { PositionId, MarketId, OrderId } from '@/types/branded'

// ─── Required wire schema (DTO) ───────────────────────────────────────────────
// THIS IS THE BACKEND CONTRACT.
// Jake must return this exact shape inside the positions[] array.

/**
 * Single position item as returned by GET /api/positions items[].
 *
 * @required Jake — the backend must produce this shape.
 */
export interface EnginePositionItemDTO {
  /** Unique position identifier. Used as React key. */
  id:                 string

  /** Market this position belongs to. Matches EngineMarketItemDTO.id. */
  market_id:          string

  /** Market question / title for display (denormalised — avoids a join). */
  market_title:       string

  /** Bitcoin market segment (matches EngineMarketItemDTO.segment). */
  segment:            string

  /** Position direction.
   *  Must be one of: 'yes' | 'no' */
  side:               string

  /** Number of contracts held. */
  contracts:          number

  /** Average entry price in cents [0, 100]. */
  entry_price:        number

  /** Current mark-to-market price in cents [0, 100]. Updated live. */
  current_price:      number

  /** Total cost paid to open this position (USD). */
  cost_basis:         number

  /** Current mark-to-market value (USD). */
  current_value:      number

  /** Unrealized P&L: current_value − cost_basis (USD, signed). */
  unrealized_pnl:     number

  /** Unrealized P&L as a decimal fraction of cost_basis (signed). */
  unrealized_pnl_pct: number

  /** Position lifecycle state.
   *  Must be one of: 'open' | 'settled-win' | 'settled-loss' | 'sold' */
  status:             string

  /** ISO 8601 — when the position was opened. */
  opened_at:          string

  /** ISO 8601 or null if position is still open. */
  closed_at:          string | null

  /** Order ID that created this position. */
  order_id:           string
}

/**
 * Full envelope returned by GET /api/positions.
 */
export interface EnginePositionsResponseDTO {
  positions:            EnginePositionItemDTO[]
  count:                number
  total_unrealized_pnl: number   // aggregate unrealized P&L across all positions (USD)
  timestamp:            string   // ISO 8601
}

// ─── Mapper (ready to activate) ───────────────────────────────────────────────

/** Convert a single wire DTO to the frontend Position domain type. */
export function toPosition(dto: EnginePositionItemDTO): Position {
  return {
    id:               dto.id           as PositionId,
    marketId:         dto.market_id    as MarketId,
    marketTitle:      dto.market_title,
    segment:          dto.segment,
    side:             dto.side         as Position['side'],
    contracts:        dto.contracts,
    entryPrice:       dto.entry_price,
    currentPrice:     dto.current_price,
    costBasis:        dto.cost_basis,
    currentValue:     dto.current_value,
    unrealizedPnl:    dto.unrealized_pnl,
    unrealizedPnlPct: dto.unrealized_pnl_pct,
    status:           dto.status       as Position['status'],
    openedAt:         dto.opened_at,
    closedAt:         dto.closed_at,
    orderId:          dto.order_id     as OrderId,
  }
}

/** Convert a populated positions envelope to a Position[]. */
export function toPositions(p: EnginePositions): Position[] {
  return (p.positions as EnginePositionItemDTO[]).map(toPosition)
}

// ─── Envelope-only helpers (available today) ─────────────────────────────────

/** Aggregate summary available from the positions envelope even when items are []. */
export interface PositionsSummary {
  count:              number
  totalUnrealizedPnl: number
}

export function toPositionsSummary(p: EnginePositions): PositionsSummary {
  return {
    count:              p.count,
    totalUnrealizedPnl: p.totalUnrealizedPnl,
  }
}
