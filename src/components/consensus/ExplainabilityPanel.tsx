'use client'

// Breaks the consensus score into its weighted drivers so users understand
// *why* the engine reads the market the way it does.

import { AnalyticsCard } from '@/components/analytics/shared'
import type { ExplainDriver } from '@/types/intelligence'
import type { Bias } from '@/types/consensus'

const DIR: Record<Bias, { color: string; arrow: string }> = {
  bullish: { color: 'var(--probex-positive)', arrow: '↑' },
  bearish: { color: 'var(--probex-negative)', arrow: '↓' },
  neutral: { color: 'var(--probex-warning)',  arrow: '→' },
}

export function ExplainabilityPanel({ drivers }: { drivers: ExplainDriver[] }) {
  return (
    <AnalyticsCard title="Why this score?" subtitle="Signals driving the consensus reading, ranked by contribution">
      <div className="flex flex-col gap-3.5">
        {drivers.map((d) => {
          const m   = DIR[d.direction]
          const pct = Math.round(d.weight * 100)
          return (
            <div key={d.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: m.color }} aria-hidden="true">{m.arrow}</span>
                  <span className="text-xs font-medium truncate" style={{ color: 'var(--probex-text-primary)' }}>{d.label}</span>
                </div>
                <span className="text-xs font-semibold tabular-nums flex-shrink-0" style={{ color: 'var(--probex-text-secondary)' }}>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--probex-border-default)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: m.color }} />
              </div>
              <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>{d.detail}</span>
            </div>
          )
        })}
      </div>
    </AnalyticsCard>
  )
}
