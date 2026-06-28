'use client'

import {cn, formatCurrency} from '@/lib/utils'
import {PortfolioMetrics}   from './PortfolioMetrics'
import {computePortfolioSummary, computeAllocationBySegment} from '@/mock/portfolio'
import {MOCK_OPEN_POSITIONS} from '@/mock/positions'
import {getPositionConsensus} from '@/mock/positionConsensus'


interface PortfolioOverviewProps {
  className?: string
}

/**
 * PortfolioOverview
 * ─────────────────
 * The executive summary section — first thing users see on the
 * portfolio page. Combines:
 *
 *   1. PortfolioMetrics  — six headline stat cards
 *   2. Exposure Summary  — top 3 segments by allocation
 *   3. Consensus Alignment Summary — how the portfolio aligns with
 *      the Probex Consensus Engine across all open positions
 *   4. Performance Snapshot — quick today/week framing
 */
export function PortfolioOverview({ className }: PortfolioOverviewProps) {
  const summary    = computePortfolioSummary()
  const allocation = computeAllocationBySegment()

  // Consensus alignment breakdown across open positions
  const alignmentCounts = MOCK_OPEN_POSITIONS.reduce(
    (acc, pos) => {
      const { alignment } = getPositionConsensus(pos)
      acc[alignment] = (acc[alignment] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const total      = MOCK_OPEN_POSITIONS.length
  const alignedPct = total > 0 ? (alignmentCounts.aligned ?? 0) / total : 0

  return (
    <div className={cn('flex flex-col gap-4', className)}>

      {/* ── Metrics row ──────────────────────────────────────────── */}
      <PortfolioMetrics />

      {/* ── Secondary summary row ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Exposure summary */}
        <div className="rounded-lg p-4 flex flex-col gap-3" style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
          <h3 className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>
            Top Exposure
          </h3>
          <div className="flex flex-col gap-2">
            {allocation.slice(0, 3).map((slice) => (
              <div key={slice.segment} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: slice.colorVar }} aria-hidden="true" />
                <span className="text-xs flex-1 truncate" style={{ color: 'var(--probex-text-secondary)' }}>{slice.label}</span>
                <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--probex-text-primary)' }}>
                  {Math.round(slice.pct * 100)}%
                </span>
              </div>
            ))}
          </div>
          {allocation.length === 0 && (
            <p className="text-xs" style={{ color: 'var(--probex-text-disabled)' }}>No open positions</p>
          )}
        </div>

        {/* Consensus alignment summary — Probex differentiator */}
        <div className="rounded-lg p-4 flex flex-col gap-3" style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--probex-primary)' }}>
              <span className="live-dot w-1.5 h-1.5" aria-hidden="true" />
              Consensus Alignment
            </h3>
            <span className="text-lg font-bold tabular-nums" style={{ color: alignedPct >= 0.5 ? 'var(--probex-positive)' : 'var(--probex-warning)' }}>
              {Math.round(alignedPct * 100)}%
            </span>
          </div>

          {/* Stacked bar */}
          <div className="flex h-2 rounded-full overflow-hidden" style={{ background: 'var(--probex-border-default)' }}>
            <div
              className="h-full"
              style={{ width: `${((alignmentCounts.aligned ?? 0) / total) * 100}%`, background: 'var(--probex-positive)' }}
              title="Aligned"
            />
            <div
              className="h-full"
              style={{ width: `${((alignmentCounts.neutral ?? 0) / total) * 100}%`, background: 'var(--probex-text-muted)' }}
              title="Neutral"
            />
            <div
              className="h-full"
              style={{ width: `${((alignmentCounts.divergent ?? 0) / total) * 100}%`, background: 'var(--probex-warning)' }}
              title="Divergent"
            />
          </div>

          <div className="flex items-center justify-between text-2xs">
            <span style={{ color: 'var(--probex-positive)' }}>
              {alignmentCounts.aligned ?? 0} aligned
            </span>
            <span style={{ color: 'var(--probex-text-muted)' }}>
              {alignmentCounts.neutral ?? 0} neutral
            </span>
            <span style={{ color: 'var(--probex-warning)' }}>
              {alignmentCounts.divergent ?? 0} contrarian
            </span>
          </div>

          <p className="text-2xs leading-relaxed" style={{ color: 'var(--probex-text-disabled)' }}>
            {alignedPct >= 0.6
              ? 'Your portfolio is strongly aligned with institutional consensus signals.'
              : alignedPct >= 0.4
                ? 'Your portfolio shows mixed alignment with the Consensus Engine.'
                : 'Your portfolio takes a contrarian stance relative to consensus signals.'}
          </p>
        </div>

        {/* Performance snapshot */}
        <div className="rounded-lg p-4 flex flex-col gap-3" style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
          <h3 className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>
            Performance Snapshot
          </h3>
          <div className="flex flex-col gap-2">
            <SnapshotRow label="Largest Win"  value={`+${formatCurrency(summary.largestWin)}`}  color="var(--probex-positive)" />
            <SnapshotRow label="Largest Loss" value={`-${formatCurrency(summary.largestLoss)}`} color="var(--probex-negative)" />
            <SnapshotRow label="Avg Win"      value={`+${formatCurrency(summary.avgWinReturn)}`} color="var(--probex-positive)" />
            <SnapshotRow label="Avg Loss"     value={`-${formatCurrency(summary.avgLossReturn)}`} color="var(--probex-negative)" />
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Snapshot Row ─────────────────────────────────────────────────────────

function SnapshotRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span style={{ color: 'var(--probex-text-muted)' }}>{label}</span>
      <span className="font-semibold tabular-nums" style={{ color }}>{value}</span>
    </div>
  )
}
