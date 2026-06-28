/**
 * Per-Market Activity Stream Mock Data
 * ──────────────────────────────────────
 * Generates activity events specific to a single market.
 * replace with live WebSocket subscription.
 */

import type { MarketId } from '@/types/branded'
import { asMarketId }    from '@/types/branded'

// ─── Types ────────────────────────────────────────────────────────────────

export type MarketEventType =
  | 'buy-yes'
  | 'buy-no'
  | 'consensus-update'
  | 'probability-change'
  | 'large-trade'
  | 'market-update'

export interface MarketActivityEvent {
  id:          string
  type:        MarketEventType
  marketId:    MarketId
  actor:       string        // anonymised e.g. "0x4a3f…"
  description: string
  amount?:     number        // USD
  priceBefore?: number       // cents
  priceAfter?:  number       // cents
  scoreBefore?: number       // consensus
  scoreAfter?:  number
  timestamp:   number        // Unix ms
}

// ─── Generator ────────────────────────────────────────────────────────────

const ACTORS = [
  '0x4a3f…d92c', '0x71bc…ef01', '0x9d2e…3a7f', '0xc891…b4d2',
  'Inst. A', 'Inst. B', 'Whale', '0x5f22…cc4e', '0xb33a…91f0',
]

const YES_AMOUNTS = [250, 500, 1200, 3000, 5000, 8500, 12000, 18000, 42000]
const NO_AMOUNTS  = [150, 300, 750,  1800, 4000, 6500, 9000]

export function generateMarketActivity(
  marketId:    string,
  probability: number,
  baseConsensus: number,
  count = 20,
): MarketActivityEvent[] {
  const now    = Date.now()
  const seed   = marketId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const events: MarketActivityEvent[] = []

  const rand = (i: number, offset = 0) => {
    const x = Math.sin((seed + offset) * 9301 + i * 49297 + 233) * 14159
    return Math.abs(x - Math.floor(x))
  }

  const pick = <T>(arr: readonly T[], i: number, offset = 0): T =>
    arr[Math.floor(rand(i, offset) * arr.length)] as T

  for (let i = 0; i < count; i++) {
    const r         = rand(i)
    const timestamp = now - i * (90_000 + Math.round(rand(i, 100) * 180_000))
    const actor     = pick(ACTORS, i)
    const eventRoll = r

    if (eventRoll < 0.40) {
      // Buy YES
      const amount = pick(YES_AMOUNTS, i, 50) as number
      const price  = Math.round(probability * 100)
      events.push({
        id:          `evt-${marketId}-${i}`,
        type:        amount > 10_000 ? 'large-trade' : 'buy-yes',
        marketId:    asMarketId(marketId),
        actor,
        description: `Bought YES at ${price}¢`,
        amount,
        priceAfter:  price,
        timestamp,
      })
    } else if (eventRoll < 0.65) {
      // Buy NO
      const amount = pick(NO_AMOUNTS, i, 200) as number
      const price  = 100 - Math.round(probability * 100)
      events.push({
        id:          `evt-${marketId}-${i}`,
        type:        'buy-no',
        marketId:    asMarketId(marketId),
        actor,
        description: `Bought NO at ${price}¢`,
        amount,
        priceAfter:  price,
        timestamp,
      })
    } else if (eventRoll < 0.80) {
      // Probability change
      const delta      = (rand(i, 300) - 0.5) * 6
      const before     = Math.round(probability * 100)
      const after      = Math.max(1, Math.min(99, before + Math.round(delta)))
      events.push({
        id:           `evt-${marketId}-${i}`,
        type:         'probability-change',
        marketId:     asMarketId(marketId),
        actor:        'Market',
        description:  `Probability moved ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`,
        priceBefore:  before,
        priceAfter:   after,
        timestamp,
      })
    } else {
      // Consensus update
      const scoreDelta = (rand(i, 400) - 0.5) * 0.08
      const before     = Math.round(baseConsensus * 100)
      const after      = Math.max(20, Math.min(99, before + Math.round(scoreDelta * 100)))
      events.push({
        id:           `evt-${marketId}-${i}`,
        type:         'consensus-update',
        marketId:     asMarketId(marketId),
        actor:        'Consensus Engine',
        description:  `Score updated to ${after}%`,
        scoreBefore:  before / 100,
        scoreAfter:   after  / 100,
        timestamp,
      })
    }
  }

  return events.sort((a, b) => b.timestamp - a.timestamp)
}

// ─── Event display helpers ────────────────────────────────────────────────

export const EVENT_COLORS: Record<MarketEventType, string> = {
  'buy-yes':           'var(--probex-yes)',
  'buy-no':            'var(--probex-no)',
  'consensus-update':  'var(--probex-primary)',
  'probability-change':'var(--probex-warning)',
  'large-trade':       'var(--probex-positive)',
  'market-update':     'var(--probex-text-muted)',
}

export const EVENT_ICONS: Record<MarketEventType, string> = {
  'buy-yes':           'Y',
  'buy-no':            'N',
  'consensus-update':  '⚡',
  'probability-change':'↕',
  'large-trade':       '◉',
  'market-update':     '·',
}

// ─── Convenience wrapper ( compatibility) ──────────────────────────────

/**
 * getMarketActivity
 * Convenience wrapper around generateMarketActivity for components that
 * don't have access to probability/consensus props.
 * Uses neutral defaults (50% probability, 50 consensus score).
 */
export function getMarketActivity(
  marketId: MarketId | string,
  count = 20,
): (MarketActivityEvent & { summary: string; ts: number })[] {
  const events = generateMarketActivity(String(marketId), 0.5, 50, count)
  return events.map((e) => ({
    ...e,
    summary: e.description,
    ts: e.timestamp,
  }))
}
