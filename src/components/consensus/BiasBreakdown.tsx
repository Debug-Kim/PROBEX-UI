'use client'

import { cn } from '@/lib/utils'
import type { ConsensusState, Bias } from '@/types/consensus'

interface BiasBreakdownProps {
  consensus:  ConsensusState
  className?: string
}

/**
 * BiasBreakdown
 * ─────────────
 * Side-by-side institutional vs retail bias display with participation bars.
 * Shows the divergence / convergence between smart money and retail sentiment.
 */
export function BiasBreakdown({ consensus, className }: BiasBreakdownProps) {
  const instPct   = Math.round(consensus.institutionalParticipation * 100)
  const retailPct = 100 - instPct

  return (
    <div className={cn('flex flex-col gap-3', className)}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>
          Bias Breakdown
        </span>
        <AlignmentIndicator inst={consensus.institutionalBias} retail={consensus.retailBias} />
      </div>

      {/* Institutional */}
      <BiasRow
        label="Institutional"
        bias={consensus.institutionalBias}
        participation={instPct}
        description="Smart money, hedge funds, registered advisors"
        icon="🏛"
      />

      {/* Retail */}
      <BiasRow
        label="Retail"
        bias={consensus.retailBias}
        participation={retailPct}
        description="Individual traders and independent participants"
        icon="👤"
      />

      {/* Participation bar */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
          <span>Institutional {instPct}%</span>
          <span>Retail {retailPct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--probex-border-default)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width:      `${instPct}%`,
              background: 'linear-gradient(90deg, var(--probex-positive), var(--probex-primary))',
            }}
          />
        </div>
      </div>

    </div>
  )
}

// ─── Bias Row ─────────────────────────────────────────────────────────────

function BiasRow({
  label, bias, participation, description, icon,
}: {
  label:         string
  bias:          Bias
  participation: number
  description:   string
  icon:          string
}) {
  const colorVar = bias === 'bullish'
    ? 'var(--probex-positive)'
    : bias === 'bearish'
      ? 'var(--probex-negative)'
      : 'var(--probex-warning)'

  const arrow = bias === 'bullish' ? '↑' : bias === 'bearish' ? '↓' : '→'

  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-lg"
      style={{
        background: `color-mix(in srgb, ${colorVar} 6%, transparent)`,
        border:     `1px solid color-mix(in srgb, ${colorVar} 14%, transparent)`,
      }}
    >
      <span className="text-lg flex-shrink-0" aria-hidden="true">{icon}</span>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-xs font-semibold" style={{ color: 'var(--probex-text-primary)' }}>
          {label}
        </span>
        <span className="text-2xs truncate" style={{ color: 'var(--probex-text-muted)' }}>
          {description}
        </span>
      </div>
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <span className="text-sm font-bold" style={{ color: colorVar }}>
          {bias.charAt(0).toUpperCase() + bias.slice(1)} {arrow}
        </span>
        <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
          {participation}% vol
        </span>
      </div>
    </div>
  )
}

// ─── Alignment indicator ──────────────────────────────────────────────────

function AlignmentIndicator({ inst, retail }: { inst: Bias; retail: Bias }) {
  const aligned = inst === retail
  const color   = aligned ? 'var(--probex-positive)' : 'var(--probex-warning)'
  const label   = aligned ? 'Aligned' : 'Divergent'

  return (
    <span
      className="text-2xs font-semibold px-2 py-0.5 rounded"
      style={{
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        color,
      }}
    >
      {label}
    </span>
  )
}
