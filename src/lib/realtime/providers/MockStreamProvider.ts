/**
 * MockStreamProvider
 *
 * Implements IMarketStreamService using a deterministic tick scheduler.
 * Driven by the existing mock/marketHistory.ts generators so it never
 * invents new market math — it just advances the generators and emits deltas.
 *
 * Seed is fixed so behaviour is reproducible in QA / test mode.
 * Tick cadence: 4 Hz (250 ms) — coalesced by StreamClient / liveStore.
 */

import type {
  IMarketStreamService,
  StreamChannel,
  StreamEvent,
  SnapshotData,
} from '@/lib/realtime/types'
import { MOCK_MARKETS } from '@/mock/markets'
import { MOCK_CONSENSUS_MAP } from '@/mock/consensus'
import { asMarketId } from '@/types/branded'

type EventHandler = (event: StreamEvent) => void

// Deterministic pseudo-random seeded with a fixed value
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

const rng = seededRandom(42)

function jitter(base: number, pct: number): number {
  return base + (rng() - 0.5) * 2 * base * pct
}

// Per-market mutable state (kept in provider, never shared with store directly)
interface MarketState {
  probability: number
  consensusScore: number
  confidence: number
  bias: 'bullish' | 'bearish' | 'neutral'
  volume: number
}


// Convert ConfidenceLevel string → numeric 0–1 for LiveMarketDelta
function confidenceToNumber(c: 'high' | 'medium' | 'low' | undefined): number {
  if (c === 'high') return 0.85
  if (c === 'medium') return 0.6
  if (c === 'low') return 0.35
  return 0.6
}

export class MockStreamProvider implements IMarketStreamService {
  private handler: EventHandler | null = null
  private seq: number = 0
  private tickTimer: ReturnType<typeof setInterval> | null = null
  private subscribedMarketIds: Set<string> = new Set()
  private includeGlobal: boolean = false
  private includeActivity: boolean = false
  private destroyed: boolean = false

  // Initialise per-market state from mock baseline
  private marketState: Map<string, MarketState> = new Map(
    MOCK_MARKETS.map((m) => {
      const consensus = MOCK_CONSENSUS_MAP[m.id as string]!
      return [
        m.id as string,
        {
          probability: m.probability,
          consensusScore: consensus?.score ?? 0.5,
          confidence: confidenceToNumber(consensus?.confidence),
          bias: consensus?.bias ?? 'neutral',
          volume: m.volume,
        },
      ]
    }),
  )

  connect(handler: EventHandler): void {
    if (this.destroyed) return
    this.handler = handler
    this.seq = 0

    // Emit initial snapshot immediately
    this.emitSnapshot()

    // Start tick loop
    this.tickTimer = setInterval(() => this.tick(), 250)
  }

  subscribe(channels: StreamChannel[]): void {
    for (const ch of channels) {
      if (ch.kind === 'market') this.subscribedMarketIds.add(ch.marketId as string)
      if (ch.kind === 'global') this.includeGlobal = true
      if (ch.kind === 'activity') this.includeActivity = true
    }
  }

  unsubscribe(channels: StreamChannel[]): void {
    for (const ch of channels) {
      if (ch.kind === 'market') this.subscribedMarketIds.delete(ch.marketId as string)
      if (ch.kind === 'global') this.includeGlobal = false
      if (ch.kind === 'activity') this.includeActivity = false
    }
  }

  resync(lastSeq: number): void {
    // Re-emit snapshot from current state; lastSeq acknowledged
    void lastSeq
    this.emitSnapshot()
  }

  disconnect(): void {
    this.destroyed = true
    if (this.tickTimer !== null) {
      clearInterval(this.tickTimer)
      this.tickTimer = null
    }
    this.handler = null
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private emit(event: Omit<StreamEvent, 'seq' | 'ts'>): void {
    if (!this.handler || this.destroyed) return
    this.seq += 1
    this.handler({ ...event, seq: this.seq, ts: Date.now() } as StreamEvent)
  }

  private emitSnapshot(): void {
    const markets: SnapshotData['markets'] = []
    for (const m of MOCK_MARKETS) {
      const state = this.marketState.get(m.id as string)
      if (!state) continue
      markets.push({
        marketId: asMarketId(m.id as string),
        probability: state.probability,
        consensusScore: state.consensusScore,
        confidence: state.confidence,
        bias: state.bias,
        volume: state.volume,
        status: m.status,
      })
    }

    const globalScore = this.computeGlobalScore()

    this.emit({
      type: 'snapshot',
      data: {
        markets,
        globalConsensusScore: globalScore,
        globalParticipation: 0.72 + (rng() - 0.5) * 0.1,
      },
    })
  }

  private tick(): void {
    if (this.destroyed || !this.handler) return
    const now = Date.now()

    // Each tick: update a random subset of subscribed markets (or all if none subscribed)
    const targets =
      this.subscribedMarketIds.size > 0
        ? [...this.subscribedMarketIds]
        : [...this.marketState.keys()]

    // Update ~30% of targets per tick for natural feel
    const toUpdate = targets.filter(() => rng() < 0.3)

    for (const id of toUpdate) {
      const state = this.marketState.get(id)
      if (!state) continue

      // Probability drift: ±0.5pp per tick on the 0–1 scale, clamped 0.01–0.99
      const probDelta = (rng() - 0.5) * 0.01
      const newProb = Math.max(0.01, Math.min(0.99, state.probability + probDelta))
      const deltaBps = Math.round((newProb - state.probability) * 10000)
      state.probability = parseFloat(newProb.toFixed(4))

      this.emit({
        type: 'probability_update',
        marketId: asMarketId(id),
        data: { probability: state.probability, deltaBps },
      })

      // Consensus drift: ±0.003 per tick on the 0–1 scale, clamped 0–1
      if (rng() < 0.4) {
        const scoreDelta = (rng() - 0.5) * 0.006
        state.consensusScore = Math.max(
          0,
          Math.min(1, state.consensusScore + scoreDelta),
        )
        state.consensusScore = parseFloat(state.consensusScore.toFixed(4))

        // Confidence drift ±0.01, clamped 0–1
        state.confidence = Math.max(
          0,
          Math.min(1, state.confidence + (rng() - 0.5) * 0.02),
        )
        state.confidence = parseFloat(state.confidence.toFixed(3))

        this.emit({
          type: 'consensus_update',
          marketId: asMarketId(id),
          data: {
            score: state.consensusScore,
            confidence: state.confidence,
            bias: state.bias,
          },
        })
      }

      // Volume tick: increment ~0–500 per tick
      if (rng() < 0.5) {
        const volDelta = Math.round(jitter(250, 0.8))
        state.volume += volDelta

        this.emit({
          type: 'volume_update',
          marketId: asMarketId(id),
          data: { volume: state.volume, delta: volDelta },
        })
      }

      // Occasional trade event for activity feed
      if (rng() < 0.15 && this.includeActivity) {
        this.emit({
          type: 'trade',
          marketId: asMarketId(id),
          data: {
            side: rng() < 0.5 ? 'yes' : 'no',
            size: Math.round(jitter(500, 0.9)),
            price: state.probability,
            ts: now,
          },
        })
      }
    }

    // Global consensus update every ~4 seconds (1-in-16 ticks at 4 Hz)
    if (this.includeGlobal && rng() < 0.0625) {
      const globalScore = this.computeGlobalScore()
      this.emit({
        type: 'global_consensus_update',
        data: {
          score: globalScore,
          participation: 0.72 + (rng() - 0.5) * 0.1,
          bullishCount: Math.round(jitter(18, 0.3)),
          bearishCount: Math.round(jitter(9, 0.3)),
        },
      })
    }
  }

  private computeGlobalScore(): number {
    let total = 0
    let count = 0
    for (const state of this.marketState.values()) {
      total += state.consensusScore
      count++
    }
    return count > 0 ? parseFloat((total / count).toFixed(4)) : 0.5
  }
}
