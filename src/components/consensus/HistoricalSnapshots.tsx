'use client'

/**
 * HistoricalSnapshots
 * ───────────────────
 * Point-in-time consensus readings over the recent window — a "rewind" of the
 * engine's state, distinct from the continuous timeline.
 */

import { useMemo } from 'react'
import { AnalyticsCard } from '@/components/analytics/shared'
import { getHistoricalSnapshots } from '@/mock/intelligence'
import type { Bias } from '@/types/consensus'

const BIAS_COLOR: Record<Bias, string> = {
  bullish: 'var(--probex-positive)',
  bearish: 'var(--probex-negative)',
  neutral: 'var(--probex-warning)',
}

export function HistoricalSnapshots({ marketId }: { marketId: string }) {
  const snapshots = useMemo(() => getHistoricalSnapshots(marketId), [marketId])

  return (
    <AnalyticsCard title="Historical Snapshots" subtitle="Consensus state at key points in the recent window">
      <div className="flex flex-col">
        {snapshots.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center gap-3 py-2.5"
            style={i < snapshots.length - 1 ? { borderBottom: '1px solid var(--probex-border)' } : undefined}
          >
            <span className="text-2xs font-semibold w-14 flex-shrink-0" style={{ color: 'var(--probex-text-muted)' }}>{s.label}</span>
            <span className="text-sm font-bold tabular-nums w-12 flex-shrink-0" style={{ color: 'var(--probex-text-primary)' }}>{s.score}%</span>
            <span className="text-2xs font-semibold tabular-nums w-12 flex-shrink-0" style={{ color: s.delta > 0 ? 'var(--probex-positive)' : s.delta < 0 ? 'var(--probex-negative)' : 'var(--probex-text-disabled)' }}>
              {s.delta > 0 ? '+' : ''}{s.delta || '—'}{s.delta ? 'pp' : ''}
            </span>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded capitalize flex-shrink-0" style={{ background: `color-mix(in srgb, ${BIAS_COLOR[s.bias]} 12%, transparent)`, color: BIAS_COLOR[s.bias] }}>
              {s.bias}
            </span>
            <span className="text-2xs capitalize ml-auto flex-shrink-0" style={{ color: 'var(--probex-text-muted)' }}>{s.signal} signal</span>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  )
}
