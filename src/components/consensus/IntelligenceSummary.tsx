'use client'

/**
 * IntelligenceSummary
 * ───────────────────
 * The narrative hero of the Consensus Engine page — explains what the market
 * means, not just its probability. Pairs the consensus gauge with a generated
 * plain-English reading and verdict.
 */

import { ConsensusScoreCard } from './ConsensusScoreCard'
import type { IntelligenceSummary as Summary } from '@/mock/intelligence'
import type { ConsensusState, Bias } from '@/types/consensus'

const DIR_COLOR: Record<Bias, string> = {
  bullish: 'var(--probex-positive)',
  bearish: 'var(--probex-negative)',
  neutral: 'var(--probex-warning)',
}

const CONVICTION_COLOR: Record<Summary['conviction'], string> = {
  High:     'var(--probex-primary)',
  Moderate: 'var(--probex-warning)',
  Low:      'var(--probex-text-muted)',
}

export function IntelligenceSummary({ summary, consensus }: { summary: Summary; consensus: ConsensusState }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
    >
      <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <span className="live-dot" aria-hidden="true" />
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-primary)' }}>Intelligence Summary</h2>
        <span className="ml-auto text-2xs font-semibold px-2 py-0.5 rounded" style={{ background: `color-mix(in srgb, ${CONVICTION_COLOR[summary.conviction]} 14%, transparent)`, color: CONVICTION_COLOR[summary.conviction] }}>
          {summary.conviction} conviction
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-5 p-5">
        {/* Gauge (reused ConsensusScoreCard) */}
        <div className="flex-shrink-0 md:w-[240px] flex items-center justify-center">
          <ConsensusScoreCard consensus={consensus} />
        </div>

        {/* Narrative */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <h3 className="text-base font-bold leading-snug" style={{ color: DIR_COLOR[summary.direction] }}>
            {summary.headline}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--probex-text-secondary)' }}>
            {summary.narrative}
          </p>
          <div
            className="flex items-start gap-2 p-3 rounded-lg mt-1"
            style={{ background: `color-mix(in srgb, ${DIR_COLOR[summary.direction]} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${DIR_COLOR[summary.direction]} 18%, transparent)` }}
          >
            <span className="text-sm flex-shrink-0" aria-hidden="true">💡</span>
            <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--probex-text-primary)' }}>
              {summary.verdict}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
