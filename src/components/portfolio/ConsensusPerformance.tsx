'use client'

import { useMemo }              from 'react'
import { cn, formatCurrency }   from '@/lib/utils'
import { ALL_POSITIONS, MOCK_SETTLED_POSITIONS } from '@/mock/positions'
import { getPositionConsensus } from '@/mock/positionConsensus'

interface ConsensusPerformanceProps {
  className?: string
}

/**
 * ConsensusPerformance
 * ─────────────────────
 * The headline Probex differentiator panel: "How well has the
 * Consensus Engine performed for this portfolio?"
 *
 * Metrics:
 *   1. Consensus Accuracy        — % of settled positions where alignment
 *                                    with the engine predicted the outcome
 *   2. Consensus Win Rate         — win rate ONLY for aligned positions
 *   3. Consensus-Aligned P&L      — total P&L from aligned positions vs
 *                                    contrarian positions
 *   4. Confidence Success Rate    — win rate filtered to 'high' confidence
 *                                    consensus readings
 */
export function ConsensusPerformance({ className }: ConsensusPerformanceProps) {
  const metrics = useMemo(() => {
    const settled = MOCK_SETTLED_POSITIONS
    const withConsensus = ALL_POSITIONS.map((p) => ({ pos: p, ...getPositionConsensus(p) }))
    const settledWithConsensus = withConsensus.filter((x) => settled.includes(x.pos))

    // Accuracy: aligned positions that won / total aligned settled positions
    const aligned       = settledWithConsensus.filter((x) => x.alignment === 'aligned')
    const alignedWins   = aligned.filter((x) => x.pos.status === 'settled-win')
    const accuracy      = aligned.length > 0 ? alignedWins.length / aligned.length : null

    // Consensus win rate vs contrarian win rate
    const divergent     = settledWithConsensus.filter((x) => x.alignment === 'divergent')
    const divergentWins = divergent.filter((x) => x.pos.status === 'settled-win')
    const contrarianRate = divergent.length > 0 ? divergentWins.length / divergent.length : null

    // Aligned P&L vs divergent P&L (settled only)
    const alignedPnl   = aligned.reduce((s, x) => s + (x.pos.status === 'settled-win' ? x.pos.contracts - x.pos.costBasis : -x.pos.costBasis), 0)
    const divergentPnl = divergent.reduce((s, x) => s + (x.pos.status === 'settled-win' ? x.pos.contracts - x.pos.costBasis : -x.pos.costBasis), 0)

    // High-confidence success rate
    const highConfidence     = settledWithConsensus.filter((x) => x.consensus?.confidence === 'high')
    const highConfidenceWins = highConfidence.filter((x) => x.pos.status === 'settled-win')
    const confidenceRate     = highConfidence.length > 0 ? highConfidenceWins.length / highConfidence.length : null

    return {
      accuracy, contrarianRate, alignedPnl, divergentPnl, confidenceRate,
      alignedCount: aligned.length, divergentCount: divergent.length, highConfidenceCount: highConfidence.length,
    }
  }, [])

  return (
    <div className={cn('rounded-xl overflow-hidden', className)} style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)', background: 'var(--probex-primary-dim)' }}>
        <div className="flex items-center gap-2">
          <span className="live-dot" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-primary)' }}>
            Consensus Engine Performance
          </h2>
        </div>
        <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>
          Based on {MOCK_SETTLED_POSITIONS.length} settled positions
        </span>
      </div>

      {/* Metrics grid */}
      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">

        <MetricBlock
          label="Consensus Accuracy"
          value={metrics.accuracy !== null ? `${Math.round(metrics.accuracy * 100)}%` : 'N/A'}
          sublabel={`${metrics.alignedCount} aligned positions`}
          color={metrics.accuracy !== null && metrics.accuracy >= 0.6 ? 'var(--probex-positive)' : 'var(--probex-warning)'}
          highlight
        />

        <MetricBlock
          label="Contrarian Win Rate"
          value={metrics.contrarianRate !== null ? `${Math.round(metrics.contrarianRate * 100)}%` : 'N/A'}
          sublabel={`${metrics.divergentCount} contrarian positions`}
          color="var(--probex-warning)"
        />

        <MetricBlock
          label="Aligned P&L"
          value={`${metrics.alignedPnl >= 0 ? '+' : ''}${formatCurrency(metrics.alignedPnl)}`}
          sublabel="From aligned positions"
          color={metrics.alignedPnl >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)'}
        />

        <MetricBlock
          label="High-Conf. Success"
          value={metrics.confidenceRate !== null ? `${Math.round(metrics.confidenceRate * 100)}%` : 'N/A'}
          sublabel={`${metrics.highConfidenceCount} high-confidence calls`}
          color="var(--probex-primary)"
        />

      </div>

      {/* Narrative footer */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--probex-border)', background: 'var(--probex-surface-2)' }}>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--probex-text-secondary)' }}>
          {metrics.accuracy !== null && metrics.accuracy >= 0.6
            ? 'Positions aligned with the Probex Consensus Engine have outperformed contrarian bets in this portfolio. '
            : 'Consensus alignment has shown mixed results for this portfolio. '}
          {metrics.alignedPnl > metrics.divergentPnl
            ? 'Aligned positions delivered stronger net P&L than contrarian positions.'
            : 'Contrarian positions delivered comparable or stronger net P&L this period.'}
        </p>
      </div>

    </div>
  )
}

// ─── Metric Block ──────────────────────────────────────────────────────────

function MetricBlock({
  label, value, sublabel, color, highlight,
}: {
  label: string; value: string; sublabel: string; color: string; highlight?: boolean
}) {
  return (
    <div
      className="flex flex-col gap-1 p-3 rounded-lg"
      style={{
        background: highlight ? `color-mix(in srgb, ${color} 6%, var(--probex-surface-2))` : 'var(--probex-surface-2)',
        border:     highlight ? `1px solid color-mix(in srgb, ${color} 22%, transparent)` : '1px solid var(--probex-border)',
      }}
    >
      <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>{label}</span>
      <span className="text-2xl font-black tabular-nums" style={{ color }}>{value}</span>
      <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>{sublabel}</span>
    </div>
  )
}
