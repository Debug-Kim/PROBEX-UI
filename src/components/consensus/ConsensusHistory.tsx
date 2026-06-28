'use client'

import { useMemo }               from 'react'
import { cn, consensusScoreColorVar } from '@/lib/utils'
import { getMockConsensusHistory }    from '@/mock/consensus'
import { ConsensusChart }             from '@/components/charts/ConsensusChart'
import { ConsensusBadge }             from '@/components/markets/ConsensusBadge'


interface ConsensusHistoryProps {
  marketId:    string
  baseScore:   number
  className?:  string
}

/**
 * ConsensusHistory
 * ─────────────────
 * Shows the historical evolution of the consensus score for a market.
 *
 * Sections:
 *   1. Mini score timeline (last 30 data points as a sparkline row)
 *   2. Key consensus events (inflection points)
 *   3. Full ConsensusChart for the selected timeframe
 *
 * replace getMockConsensusHistory with IConsensusService.getHistory.
 */
export function ConsensusHistory({ marketId, baseScore, className }: ConsensusHistoryProps) {
  const history = useMemo(
    () => getMockConsensusHistory(marketId, 30),
    [marketId],
  )

  // Identify inflection points (score change > 5pp)
  const inflections = useMemo(() => {
    const points: Array<{ timestamp: number; score: number; delta: number }> = []
    for (let i = 1; i < history.length; i++) {
      const prev  = history[i - 1]
      const curr  = history[i]
      if (!prev || !curr) continue
      const delta = curr.score - prev.score
      if (Math.abs(delta) > 0.05) {
        points.push({ timestamp: curr.timestamp, score: curr.score, delta })
      }
    }
    return points.slice(-3)  // show last 3 inflection points
  }, [history])

  const latestScore = history.at(-1)?.score ?? baseScore
  const prevScore   = history.at(-8)?.score ?? baseScore
  const weekDelta   = ((latestScore - prevScore) * 100).toFixed(1)
  const weekUp      = latestScore >= prevScore

  return (
    <div
      className={cn('rounded-xl overflow-hidden', className)}
      style={{
        background: 'var(--probex-surface)',
        border:     '1px solid var(--probex-border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--probex-border)' }}
      >
        <div className="flex items-center gap-2">
          <span className="live-dot" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-primary)' }}>
            Consensus History
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <ConsensusBadge score={latestScore} size="sm" />
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ color: weekUp ? 'var(--probex-positive)' : 'var(--probex-negative)' }}
          >
            {weekUp ? '+' : ''}{weekDelta}pp 7d
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* Mini sparkline row */}
        <div className="flex flex-col gap-1.5">
          <span className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>
            30-period trend
          </span>
          <MiniSparkline points={history.map((p) => p.score)} />
        </div>

        {/* Inflection points */}
        {inflections.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>
              Key Consensus Moves
            </span>
            {inflections.map((pt, i) => (
              <InflectionRow key={i} point={pt} />
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="divider" />

        {/* Full chart */}
        <div className="flex flex-col gap-2">
          <span className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>
            Score vs Institutional vs Retail
          </span>
          <ConsensusChart
            marketId={marketId}
            baseScore={baseScore}
            height={160}
            showBreakdown={true}
          />
        </div>

      </div>
    </div>
  )
}

// ─── Mini Sparkline ────────────────────────────────────────────────────────

function MiniSparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null

  const min  = Math.min(...points) - 0.02
  const max  = Math.max(...points) + 0.02
  const range = max - min || 0.01
  const W    = 280
  const H    = 32
  const step = W / (points.length - 1)

  const pts = points.map((p, i) => {
    const x = i * step
    const y = H - ((p - min) / range) * H
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  const latest = points.at(-1) ?? 0.65
  const color  = consensusScoreColorVar(latest)

  return (
    <div className="flex items-end gap-2">
      <svg
        width={W}
        height={H + 2}
        viewBox={`0 0 ${W} ${H + 2}`}
        className="overflow-visible flex-1"
        aria-label={`Consensus trend over ${points.length} periods`}
        role="img"
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0}   />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <polygon
          points={`0,${H + 2} ${pts} ${W},${H + 2}`}
          fill="url(#sparkGrad)"
        />
        {/* Line */}
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Last point dot */}
        <circle
          cx={((points.length - 1) * step).toFixed(1)}
          cy={(H - ((latest - min) / range) * H).toFixed(1)}
          r="3"
          fill={color}
        />
      </svg>
    </div>
  )
}

// ─── Inflection row ────────────────────────────────────────────────────────

function InflectionRow({
  point,
}: {
  point: { timestamp: number; score: number; delta: number }
}) {
  const up    = point.delta > 0
  const color = up ? 'var(--probex-positive)' : 'var(--probex-negative)'
  const date  = new Date(point.timestamp).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric',
  })

  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold"
        style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
        aria-hidden="true"
      >
        {up ? '↑' : '↓'}
      </span>
      <span className="flex-1 text-xs" style={{ color: 'var(--probex-text-secondary)' }}>
        Score moved{' '}
        <span className="font-semibold" style={{ color }}>
          {up ? '+' : ''}{(point.delta * 100).toFixed(1)}pp
        </span>
        {' '}to{' '}
        <span className="font-semibold" style={{ color: 'var(--probex-text-primary)' }}>
          {Math.round(point.score * 100)}%
        </span>
      </span>
      <span className="text-2xs flex-shrink-0" style={{ color: 'var(--probex-text-disabled)' }}>
        {date}
      </span>
    </div>
  )
}
