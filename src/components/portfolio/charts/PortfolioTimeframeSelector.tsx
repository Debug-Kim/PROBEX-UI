'use client'

import { cn }                from '@/lib/utils'
import { usePortfolioStore } from '@/store/portfolioStore'
import type { TimeRange }    from '@/types/market'

const TIMEFRAMES: Array<{ value: TimeRange; label: string }> = [
  { value: '7d',   label: '1W' },
  { value: '30d',  label: '1M' },
  { value: '90d',  label: '3M' },
  { value: 'all',  label: 'ALL' },
]

/**
 * PortfolioTimeframeSelector
 * ───────────────────────────
 * Timeframe selector bound to portfolioStore.chartTimeframe.
 *
 * This is intentionally separate from components/charts/TimeframeSelector,
 * which is bound to marketStore.activeTimeframe for market detail charts.
 * Two different stores serve two different chart contexts — using the
 * shared selector here would silently update the wrong store.
 */
export function PortfolioTimeframeSelector({ className }: { className?: string }) {
  const chartTimeframe   = usePortfolioStore((s) => s.chartTimeframe)
  const setChartTimeframe = usePortfolioStore((s) => s.setChartTimeframe)

  return (
    <div
      className={cn('flex items-center gap-0 rounded-md overflow-hidden', className)}
      style={{ border: '1px solid var(--probex-border-default)' }}
      role="group"
      aria-label="Portfolio chart timeframe"
    >
      {TIMEFRAMES.map((tf, idx) => (
        <button
          key={tf.value}
          onClick={() => setChartTimeframe(tf.value)}
          aria-pressed={chartTimeframe === tf.value}
          className="text-xs font-semibold px-3 py-1.5 cursor-pointer transition-all duration-100"
          style={{
            background:  chartTimeframe === tf.value ? 'var(--probex-primary-dim)' : 'transparent',
            color:       chartTimeframe === tf.value ? 'var(--probex-primary)' : 'var(--probex-text-muted)',
            borderRight: idx < TIMEFRAMES.length - 1 ? '1px solid var(--probex-border-default)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (chartTimeframe !== tf.value)
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
          }}
          onMouseLeave={(e) => {
            if (chartTimeframe !== tf.value)
              e.currentTarget.style.background = 'transparent'
          }}
        >
          {tf.label}
        </button>
      ))}
    </div>
  )
}
