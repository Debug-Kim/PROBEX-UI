'use client'

/**
 * RecommendationCard
 * ──────────────────
 * Surfaces the trading layer's formal recommendation — reused verbatim from the
 * recommendation engine (selectMergedMarket → MergedMarketView.recommendation).
 * No recommendation logic is re-implemented here; this is presentation only.
 */

import { LiveIndicator } from '@/components/live/LiveIndicator'
import type { RecommendationOutput, RecommendationLevel } from '@/lib/realtime/types'

interface RecommendationCardProps {
  recommendation: RecommendationOutput
  consensusScore: number   // 0–1
  probability:    number   // 0–1
  isLive:         boolean
}

const REC_META: Record<RecommendationLevel, { color: string; sub: string }> = {
  strong_buy_yes: { color: 'var(--probex-yes)',      sub: 'High-conviction YES' },
  buy_yes:        { color: 'var(--probex-positive)', sub: 'Lean YES' },
  hold:           { color: 'var(--probex-warning)',  sub: 'No clear edge' },
  buy_no:         { color: 'var(--probex-negative)', sub: 'Lean NO' },
  strong_buy_no:  { color: 'var(--probex-no)',       sub: 'High-conviction NO' },
}

export function RecommendationCard({ recommendation, consensusScore, probability, isLive }: RecommendationCardProps) {
  const meta = REC_META[recommendation.level]
  const gap  = Math.round((consensusScore - probability) * 100)
  const conf = Math.round(recommendation.confidence * 100)

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>Recommendation Engine</h2>
        {isLive && <LiveIndicator variant="dot" />}
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Headline recommendation */}
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${meta.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${meta.color} 22%, transparent)` }}>
          <div className="flex flex-col">
            <span className="text-lg font-black leading-none" style={{ color: meta.color }}>{recommendation.label}</span>
            <span className="text-2xs mt-1" style={{ color: 'var(--probex-text-muted)' }}>{meta.sub}</span>
          </div>
        </div>

        {/* Supporting metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Consensus edge" value={`${gap > 0 ? '+' : ''}${gap}pp`} color={gap > 0 ? 'var(--probex-positive)' : gap < 0 ? 'var(--probex-negative)' : 'var(--probex-text-secondary)'} hint="vs market price" />
          <Metric label="Engine confidence" value={`${conf}%`} color="var(--probex-primary)" hint={recommendation.confidence >= 0.7 ? 'high' : recommendation.confidence >= 0.5 ? 'medium' : 'low'} />
        </div>

        <p className="text-2xs leading-relaxed" style={{ color: 'var(--probex-text-disabled)' }}>
          The engine compares the consensus score against the market-implied probability and weights the result by prediction confidence. Edge above the action threshold triggers a directional call.
        </p>
      </div>
    </div>
  )
}

function Metric({ label, value, color, hint }: { label: string; value: string; color: string; hint: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-2.5 rounded-lg" style={{ background: 'var(--probex-surface-2)' }}>
      <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-disabled)' }}>{label}</span>
      <span className="text-lg font-bold tabular-nums leading-none" style={{ color }}>{value}</span>
      <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>{hint}</span>
    </div>
  )
}
