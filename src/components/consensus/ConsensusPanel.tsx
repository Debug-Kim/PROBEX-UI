'use client'

import { cn, consensusScoreColorVar } from '@/lib/utils'
import type { ConsensusState, MarketStructure } from '@/types/consensus'
import { ConsensusScoreCard }          from './ConsensusScoreCard'
import { BiasBreakdown }               from './BiasBreakdown'

interface ConsensusPanelProps {
  consensus:       ConsensusState
  className?:      string
 marketId?: string // unused in panel but accepted for compat
 liveScore?: number | undefined // live consensus score overlay
 liveConfidence?: number | undefined // live confidence overlay
}

/**
 * ConsensusPanel
 * ──────────────
 * The complete Consensus Intelligence panel for the market detail page.
 * This is Probex's core product differentiator — it should dominate
 * the left column of the market detail layout.
 *
 * Sections:
 *   1. ConsensusScoreCard  — large gauge + primary signals
 *   2. BiasBreakdown       — institutional vs retail comparison
 *   3. Market Structure    — current regime
 *   4. Engine metadata     — velocity, last updated
 */
export function ConsensusPanel({ consensus, className, liveScore }: ConsensusPanelProps) {
  // Use the live score when available, falling back to the static consensus.
  const displayScore  = liveScore ?? consensus.score
  const scoreColor    = consensusScoreColorVar(displayScore)
  const velocityColor = consensus.consensusVelocity > 0.05
    ? 'var(--probex-positive)'
    : consensus.consensusVelocity < -0.05
      ? 'var(--probex-negative)'
      : 'var(--probex-warning)'

  const velocityLabel = consensus.consensusVelocity > 0.05
    ? `+${(consensus.consensusVelocity * 100).toFixed(1)}% rising`
    : consensus.consensusVelocity < -0.05
      ? `${(consensus.consensusVelocity * 100).toFixed(1)}% falling`
      : 'Stable'

  // Derive trend direction from velocity for directional arrow
  const trendArrow  = consensus.consensusVelocity > 0.05 ? '↑'
    : consensus.consensusVelocity < -0.05 ? '↓' : '→'
  const trendLabel  = consensus.consensusVelocity > 0.05 ? 'Rising'
    : consensus.consensusVelocity < -0.05 ? 'Falling' : 'Stable'

  // Signal quality composite
  const signalQuality = consensus.signalStrength === 'strong' && consensus.confidence === 'high'
    ? 'Premium'
    : consensus.signalStrength === 'weak' || consensus.confidence === 'low'
      ? 'Weak'
      : 'Standard'

  const signalQualityColor = signalQuality === 'Premium' ? 'var(--probex-primary)'
    : signalQuality === 'Weak' ? 'var(--probex-text-muted)'
    : 'var(--probex-text-secondary)'

  return (
    <div
      className={cn('flex flex-col gap-0 rounded-xl overflow-hidden', className)}
      style={{
        background: 'var(--probex-surface)',
        border:     '1px solid var(--probex-border)',
      }}
    >
      {/* ── Panel Header ────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--probex-border)' }}
      >
        <div className="flex items-center gap-2">
          <span className="live-dot" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-primary)' }}>
            Consensus Engine
          </h2>
          {/* Signal quality badge */}
          <span
            className="text-2xs font-semibold px-1.5 py-0.5 rounded"
            style={{
              background: `color-mix(in srgb, ${signalQualityColor} 10%, transparent)`,
              color:      signalQualityColor,
              border:     `1px solid color-mix(in srgb, ${signalQualityColor} 18%, transparent)`,
            }}
          >
            {signalQuality}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Trend direction arrow */}
          <span
            className="text-xs font-bold"
            style={{ color: velocityColor }}
            aria-label={`Trend: ${trendLabel}`}
            title={`Consensus ${trendLabel}`}
          >
            {trendArrow}
          </span>
          <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
            {formatAgo(consensus.updatedAt)}
          </span>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-4">

        {/* Score Card — the hero element */}
        <ConsensusScoreCard consensus={consensus} />

        {/* Divider */}
        <div className="divider" />

        {/* Bias Breakdown */}
        <BiasBreakdown consensus={consensus} />

        {/* Divider */}
        <div className="divider" />

        {/* Market Structure + Secondary Signals */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>
            Market Signals
          </span>

          <SignalRow label="Market Structure" value={formatStructure(consensus.marketStructure)} colorVar={scoreColor} />

          <SignalRow
            label="Trend Strength"
            value={`${Math.round(consensus.trendStrength * 100)}%`}
            colorVar={scoreColor}
            bar={{ value: consensus.trendStrength }}
            delta={consensus.consensusVelocity > 0.02 ? `${trendArrow}` : undefined}
            deltaColor={velocityColor}
          />

          <SignalRow
            label="Prediction Confidence"
            value={`${Math.round(consensus.predictionConfidence * 100)}%`}
            colorVar={scoreColor}
            bar={{ value: consensus.predictionConfidence }}
          />

          <SignalRow
            label="Volatility"
            value={capitalize(consensus.volatilityRating)}
            colorVar={
              consensus.volatilityRating === 'extreme' || consensus.volatilityRating === 'high'
                ? 'var(--probex-negative)'
                : consensus.volatilityRating === 'medium'
                  ? 'var(--probex-warning)'
                  : 'var(--probex-positive)'
            }
          />

          <SignalRow
            label="Consensus Velocity"
            value={velocityLabel}
            colorVar={velocityColor}
            delta={trendArrow}
            deltaColor={velocityColor}
          />

          <SignalRow
            label="Inst. Participation"
            value={`${Math.round(consensus.institutionalParticipation * 100)}%`}
            colorVar="var(--probex-text-secondary)"
            bar={{ value: consensus.institutionalParticipation }}
          />
        </div>

      </div>

      {/* ── Footer: engine metadata ───────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          borderTop:  '1px solid var(--probex-border)',
          background: 'var(--probex-surface-2)',
        }}
      >
        <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
          QUBO Consensus Engine v2
        </span>
        <span className="text-2xs flex items-center gap-1" style={{ color: 'var(--probex-positive)' }}>
          <span className="live-dot w-1 h-1" aria-hidden="true" />
          99.42% uptime · &lt;90ms
        </span>
      </div>
    </div>
  )
}

// ─── Signal Row ───────────────────────────────────────────────────────────

function SignalRow({
  label, value, colorVar, bar, delta, deltaColor,
}: {
  label:       string
  value:       string
  colorVar:    string
  bar?:        { value: number } | undefined
  delta?:      string | undefined
  deltaColor?: string | undefined
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--probex-text-secondary)' }}>{label}</span>
        <div className="flex items-center gap-1.5">
          {delta && (
            <span className="text-2xs font-semibold" style={{ color: deltaColor ?? colorVar }}>
              {delta}
            </span>
          )}
          <span className="text-xs font-semibold" style={{ color: colorVar }}>{value}</span>
        </div>
      </div>
      {bar && (
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--probex-border-default)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round(bar.value * 100)}%`, background: colorVar }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function formatStructure(s: MarketStructure): string {
  const map: Record<MarketStructure, string> = {
    'trending-up':   'Trending Up ↑',
    'trending-down': 'Trending Down ↓',
    'ranging':       'Ranging →',
    'accumulation':  'Accumulation',
    'distribution':  'Distribution',
    'breakout':      'Breakout ↑',
    'breakdown':     'Breakdown ↓',
  }
  return map[s] ?? s
}

function formatAgo(iso: string): string {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  return `${Math.round(diff / 3600)}h ago`
}
