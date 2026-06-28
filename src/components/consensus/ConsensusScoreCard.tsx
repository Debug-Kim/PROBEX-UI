'use client'

import {cn, consensusScoreColorVar, formatBias} from '@/lib/utils'
import type { ConsensusState } from '@/types/consensus'


interface ConsensusScoreCardProps {
  consensus:  ConsensusState
  className?: string
}

/**
 * ConsensusScoreCard
 * ──────────────────
 * The hero element of the Consensus Intelligence panel.
 * Large circular gauge + primary metadata.
 *
 * Visual design intent:
 *   This should be the most visually striking element on the market detail
 *   page. Users should read the consensus score before the probability.
 *   The gauge diameter, color, and animation all serve this priority.
 */
export function ConsensusScoreCard({ consensus, className }: ConsensusScoreCardProps) {
  const pct         = Math.round(consensus.score * 100)
  const colorVar    = consensusScoreColorVar(consensus.score)

  // SVG arc math — 160px circle, radius 68
  const R           = 68
  const CIRC        = 2 * Math.PI * R
  const arcLength   = CIRC * 0.75                    // 270° sweep
  const dashOffset  = arcLength - (arcLength * pct / 100)

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>

      {/* ── Gauge ──────────────────────────────────────────────────── */}
      <div className="relative" style={{ width: 160, height: 160 }}>
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          style={{ transform: 'rotate(135deg)' }}
          aria-label={`Consensus score: ${pct}%`}
        >
          {/* Track */}
          <circle
            cx="80" cy="80" r={R}
            fill="none"
            stroke="var(--probex-border-default)"
            strokeWidth="10"
            strokeDasharray={`${arcLength} ${CIRC}`}
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx="80" cy="80" r={R}
            fill="none"
            stroke={colorVar}
            strokeWidth="10"
            strokeDasharray={`${arcLength - dashOffset} ${CIRC}`}
            strokeLinecap="round"
            style={{
              filter:     `drop-shadow(0 0 6px ${colorVar}55)`,
              transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-black tabular-nums leading-none"
            style={{ color: colorVar }}
          >
            {pct}%
          </span>
          <span className="text-xs font-semibold mt-1 uppercase tracking-widest" style={{ color: 'var(--probex-text-muted)' }}>
            Consensus
          </span>
        </div>
      </div>

      {/* ── Primary metadata row ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <MetaCell label="Signal" value={capitalize(consensus.signalStrength)} colorVar={colorVar} />
        <MetaCell label="Confidence" value={capitalize(consensus.confidence)} colorVar={colorVar} />
        <MetaCell
          label="Inst. Bias"
          value={formatBias(consensus.institutionalBias).split(' ')[0] ?? ''}
          colorVar={biasColor(consensus.institutionalBias)}
          arrow={biasArrow(consensus.institutionalBias)}
        />
        <MetaCell
          label="Retail Bias"
          value={formatBias(consensus.retailBias).split(' ')[0] ?? ''}
          colorVar={biasColor(consensus.retailBias)}
          arrow={biasArrow(consensus.retailBias)}
        />
      </div>
    </div>
  )
}

// ─── MetaCell ─────────────────────────────────────────────────────────────

function MetaCell({
  label, value, colorVar, arrow,
}: {
  label:    string
  value:    string
  colorVar: string
  arrow?:   string
}) {
  return (
    <div
      className="flex flex-col gap-0.5 p-2.5 rounded-lg"
      style={{
        background: `color-mix(in srgb, ${colorVar} 8%, transparent)`,
        border:     `1px solid color-mix(in srgb, ${colorVar} 18%, transparent)`,
      }}
    >
      <span className="text-2xs uppercase tracking-wider font-medium" style={{ color: 'var(--probex-text-muted)' }}>
        {label}
      </span>
      <span className="text-sm font-bold" style={{ color: colorVar }}>
        {value}{arrow && <span className="ml-0.5 opacity-80">{arrow}</span>}
      </span>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const biasColor = (bias: string) =>
  bias === 'bullish' ? 'var(--probex-positive)'
  : bias === 'bearish' ? 'var(--probex-negative)'
  : 'var(--probex-warning)'

const biasArrow = (bias: string) =>
  bias === 'bullish' ? '↑' : bias === 'bearish' ? '↓' : '→'
