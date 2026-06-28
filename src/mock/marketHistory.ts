/**
 * Market Price History Mock Data
 * ───────────────────────────────
 * Generates deterministic probability and volume history for any market ID.
 * Same seed → same chart shape every render.
 * replace with IMarketService.getMarketHistory API call.
 */

import type { PricePoint, TimeRange } from '@/types/market'

// ─── Point count per range ────────────────────────────────────────────────

const POINTS: Record<TimeRange, number> = {
  '1h':  60,
  '24h': 96,   // 15-min intervals
  '7d':  168,  // 1-hour intervals
  '30d': 120,  // 6-hour intervals
  '90d': 90,   // daily
  'all': 180,  // daily since Jan 2026
}

const INTERVAL_MS: Record<TimeRange, number> = {
  '1h':  60_000,
  '24h': 15 * 60_000,
  '7d':  3_600_000,
  '30d': 6 * 3_600_000,
  '90d': 86_400_000,
  'all': 86_400_000,
}

// ─── Generator ────────────────────────────────────────────────────────────

/**
 * Generates probability history for a market.
 * Uses a seeded random walk (Brownian-motion-like) for realistic shape.
 */
export function generatePriceHistory(
  marketId:    string,
  baseProbability: number,
  range:       TimeRange = '7d',
): PricePoint[] {
  const n          = POINTS[range]
  const intervalMs = INTERVAL_MS[range]
  const now        = Date.now()
  const startTs    = now - n * intervalMs

  // Deterministic seed from marketId
  const seed = marketId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

  // Seeded pseudo-random number (0–1)
  const rand = (i: number) => {
    const x = Math.sin(seed * 9301 + i * 49297 + 233) * 14159
    return x - Math.floor(x)
  }

  const points: PricePoint[] = []
  let prob    = Math.max(0.05, Math.min(0.95, baseProbability - 0.12))
  let baseVol = 50_000 + (seed % 200_000)

  for (let i = 0; i < n; i++) {
    const r      = rand(i)
    const drift  = (baseProbability - prob) * 0.04   // mean-reversion toward final value
    const noise  = (r - 0.5) * 0.04
    prob         = Math.max(0.02, Math.min(0.98, prob + drift + noise))

    const volMulti = 0.6 + rand(i + 1000) * 0.8
    const volume   = baseVol * volMulti

    points.push({
      timestamp:   startTs + i * intervalMs,
      probability: Math.round(prob * 1000) / 1000,
      volume,
    })
  }

  return points
}

// ─── Consensus history generator ──────────────────────────────────────────

export interface ConsensusPoint {
  timestamp:  number
  score:      number
  instScore:  number   // 0–1 institutional component
  retailScore: number  // 0–1 retail component
}

/**
 * Generates consensus score history for a market.
 */
export function generateConsensusHistory(
  marketId:    string,
  baseScore:   number,
  range:       TimeRange = '7d',
): ConsensusPoint[] {
  const n          = POINTS[range]
  const intervalMs = INTERVAL_MS[range]
  const now        = Date.now()
  const startTs    = now - n * intervalMs

  const seed = marketId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + 7777
  const rand = (i: number) => {
    const x = Math.sin(seed * 9301 + i * 49297 + 233) * 14159
    return x - Math.floor(x)
  }

  const points: ConsensusPoint[] = []
  let score      = Math.max(0.3, Math.min(0.97, baseScore - 0.08))
  let instScore  = score + 0.05
  let retailScore = score - 0.08

  for (let i = 0; i < n; i++) {
    const r      = rand(i)
    const drift  = (baseScore - score) * 0.05
    const noise  = (r - 0.5) * 0.03
    score        = Math.max(0.2, Math.min(0.99, score + drift + noise))
    instScore    = Math.max(0.15, Math.min(0.99, instScore + (r - 0.5) * 0.025))
    retailScore  = Math.max(0.1,  Math.min(0.99, retailScore + (rand(i + 500) - 0.5) * 0.035))

    points.push({
      timestamp:   startTs + i * intervalMs,
      score:       Math.round(score * 1000) / 1000,
      instScore:   Math.round(instScore * 1000) / 1000,
      retailScore: Math.round(retailScore * 1000) / 1000,
    })
  }

  return points
}

// ─── Volume-only history ──────────────────────────────────────────────────

export interface VolumePoint {
  timestamp: number
  volume:    number
  yesVol:    number
  noVol:     number
}

export function generateVolumeHistory(
  marketId: string,
  base24hVol: number,
  range:    TimeRange = '7d',
): VolumePoint[] {
  const n          = POINTS[range]
  const intervalMs = INTERVAL_MS[range]
  const now        = Date.now()
  const startTs    = now - n * intervalMs

  const seed   = marketId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + 3333
  const rand   = (i: number) => {
    const x = Math.sin(seed * 9301 + i * 49297 + 233) * 14159
    return x - Math.floor(x)
  }

  const pointsPerDay = 86_400_000 / intervalMs
  const perPoint     = base24hVol / pointsPerDay

  return Array.from({ length: n }, (_, i) => {
    const r        = rand(i)
    const mult     = 0.3 + r * 1.5                 // 0.3x–1.8x variance
    const total    = perPoint * mult
    const yesFrac  = 0.4 + rand(i + 111) * 0.3    // 40–70% YES
    return {
      timestamp: startTs + i * intervalMs,
      volume:    Math.round(total),
      yesVol:    Math.round(total * yesFrac),
      noVol:     Math.round(total * (1 - yesFrac)),
    }
  })
}

// ─── Convenience wrappers ( compatibility) ─────────────────────────────

/**
 * getProbabilityHistory / getConsensusHistory / getVolumeHistory
 * Convenience wrappers for MarketCharts.
 * Returns data normalised to { ts, probability/score/volume } shape.
 */
export function getProbabilityHistory(
  marketId: string,
  range: TimeRange = '7d',
): Array<{ ts: number; probability: number; volume: number }> {
  return generatePriceHistory(marketId, 0.62, range).map((p) => ({
    ts: p.timestamp,
    probability: p.probability,
    volume: p.volume,
  }))
}

export function getConsensusHistory(
  marketId: string,
  range: TimeRange = '7d',
): Array<{ ts: number; score: number; instScore: number; retailScore: number }> {
  return generateConsensusHistory(marketId, 62, range).map((p) => ({
    ts: p.timestamp,
    score: p.score,
    instScore: p.instScore,
    retailScore: p.retailScore,
  }))
}

export function getVolumeHistory(
  marketId: string,
  range: TimeRange = '7d',
): Array<{ ts: number; volume: number; yesVol: number; noVol: number }> {
  return generateVolumeHistory(marketId, 250_000, range).map((p) => ({
    ts: p.timestamp,
    volume: p.volume,
    yesVol: p.yesVol,
    noVol: p.noVol,
  }))
}
