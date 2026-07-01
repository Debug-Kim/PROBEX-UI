// ─── Engine edges mapper ──────────────────────────────────────────────────────
//
// 🟡 COVERAGE: /api/edges envelope works; items[] are currently unknown[].
//
// Edges are the engine's primary trading signal output — each edge represents
// a market where the bot has detected a probability mispricing worth trading.
//
// The frontend LiveMarketsView displays:
//   - edge magnitude (sortable column)
//   - recommendation level ('strong_buy_yes' → 'strong_buy_no')
//   - consensus score (from global consensus, not from this endpoint)
//
// The MergedMarketView type (src/lib/realtime/) merges REST market data with
// live WebSocket updates. Edge items slot into that merge layer.
//
// When items arrive, wire into:
//   LiveEngineService.getEdges() → adapt with toEdgeMap()
//   useMarketStream() merges edge data into MergedMarketView per market

import type { EngineEdges } from '@/types/engine'

// ─── Required wire schema (DTO) ───────────────────────────────────────────────
// THIS IS THE BACKEND CONTRACT.
// Jake must return this exact shape inside the edges[] array.

/**
 * Single edge signal as returned by GET /api/edges items[].
 *
 * @required Jake — the backend must produce this shape.
 */
export interface EngineEdgeItemDTO {
  /** Unique edge identifier. */
  id:             string

  /** Market this edge applies to. Matches EngineMarketItemDTO.id. */
  market_id:      string

  /** Market title for display (denormalised). */
  market_title:   string

  /** Bitcoin market segment. */
  segment:        string

  /** Directional edge: 'yes' = bet YES, 'no' = bet NO. */
  direction:      string

  /** Raw edge magnitude [0.0, 1.0]. e.g. 0.08 = 8% edge over market price. */
  edge:           number

  /** Kelly-criterion-adjusted recommended position size [0.0, 1.0].
   *  Fraction of bankroll to deploy. */
  kelly_size:     number

  /** Engine confidence in this edge [0.0, 1.0]. */
  confidence:     number

  /** Source signal that generated this edge (e.g. 'consensus_divergence',
   *  'price_momentum', 'on_chain_signal'). */
  signal:         string

  /** Composite recommendation for display in LiveMarketRow signal column.
   *  Must be one of:
   *   'strong_buy_yes' | 'buy_yes' | 'hold' | 'buy_no' | 'strong_buy_no' */
  recommendation: string

  /** ISO 8601 or null — when this signal expires (null = persists until resolved). */
  expires_at:     string | null

  /** ISO 8601 — when the edge was detected. */
  detected_at:    string
}

/**
 * Full envelope returned by GET /api/edges.
 */
export interface EngineEdgesResponseDTO {
  edges:     EngineEdgeItemDTO[]
  count:     number
  limit:     number
  timestamp: string   // ISO 8601
}

// ─── View model ───────────────────────────────────────────────────────────────

/**
 * Slim edge view keyed by market_id — ready to merge into MergedMarketView.
 * The LiveMarketsView sorts and renders based on these fields.
 */
export interface EdgeViewModel {
  marketId:       string
  direction:      'yes' | 'no'
  edge:           number
  kellySizes:     number
  confidence:     number
  signal:         string
  recommendation: 'strong_buy_yes' | 'buy_yes' | 'hold' | 'buy_no' | 'strong_buy_no'
  detectedAt:     number   // epoch ms
  expiresAt:      number | null
}

// ─── Mappers (ready to activate) ─────────────────────────────────────────────

export function toEdgeViewModel(dto: EngineEdgeItemDTO): EdgeViewModel {
  return {
    marketId:       dto.market_id,
    direction:      dto.direction       as EdgeViewModel['direction'],
    edge:           dto.edge,
    kellySizes:     dto.kelly_size,
    confidence:     dto.confidence,
    signal:         dto.signal,
    recommendation: dto.recommendation  as EdgeViewModel['recommendation'],
    detectedAt:     new Date(dto.detected_at).getTime(),
    expiresAt:      dto.expires_at ? new Date(dto.expires_at).getTime() : null,
  }
}

/**
 * Convert a populated edges envelope to a Map<marketId, EdgeViewModel>.
 * Keyed by market_id for O(1) lookup in the market stream merge layer.
 */
export function toEdgeMap(e: EngineEdges): Map<string, EdgeViewModel> {
  const map = new Map<string, EdgeViewModel>()
  for (const raw of e.edges as EngineEdgeItemDTO[]) {
    map.set(raw.market_id, toEdgeViewModel(raw))
  }
  return map
}

// ─── Envelope-only helpers (available today) ─────────────────────────────────

export interface EdgesSummary {
  count: number
  limit: number
}

export function toEdgesSummary(e: EngineEdges): EdgesSummary {
  return { count: e.count, limit: e.limit }
}
