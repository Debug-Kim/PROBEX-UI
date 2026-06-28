'use client'

import { cn }                from '@/lib/utils'
import { useMarketStore }    from '@/store/marketStore'
import type { TimeRange }    from '@/types/market'

const TIMEFRAMES: Array<{ value: TimeRange; label: string }> = [
  { value: '24h',  label: '1D' },
  { value: '7d',   label: '1W' },
  { value: '30d',  label: '1M' },
  { value: '90d',  label: '3M' },
  { value: 'all',  label: 'ALL' },
]

export function TimeframeSelector({ className }: { className?: string }) {
  const { activeTimeframe, setTimeframe } = useMarketStore()

  return (
    <div
      className={cn('flex items-center gap-0 rounded-md overflow-hidden', className)}
      style={{ border: '1px solid var(--probex-border-default)' }}
      role="group"
      aria-label="Chart timeframe"
    >
      {TIMEFRAMES.map((tf, idx) => (
        <button
          key={tf.value}
          onClick={() => setTimeframe(tf.value)}
          aria-pressed={activeTimeframe === tf.value}
          className="text-xs font-semibold px-3 py-1.5 cursor-pointer transition-all duration-100"
          style={{
            background:  activeTimeframe === tf.value ? 'var(--probex-primary-dim)' : 'transparent',
            color:       activeTimeframe === tf.value ? 'var(--probex-primary)' : 'var(--probex-text-muted)',
            borderRight: idx < TIMEFRAMES.length - 1 ? '1px solid var(--probex-border-default)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (activeTimeframe !== tf.value)
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
          }}
          onMouseLeave={(e) => {
            if (activeTimeframe !== tf.value)
              e.currentTarget.style.background = 'transparent'
          }}
        >
          {tf.label}
        </button>
      ))}
    </div>
  )
}
