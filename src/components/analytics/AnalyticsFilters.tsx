'use client'

/** Analytics Filters — timeframe, view-mode, and breakdown controls wired to analyticsStore. */

import { cn }                from '@/lib/utils'
import { useAnalyticsStore } from '@/store/analyticsStore'
import type { AnalyticsTimeframe, AnalyticsViewMode } from '@/types/analytics'

interface AnalyticsFiltersProps {
  className?: string
}

const TIMEFRAMES: Array<{ value: AnalyticsTimeframe; label: string }> = [
  { value: '1d',  label: '1D'  },
  { value: '1w',  label: '1W'  },
  { value: '1m',  label: '1M'  },
  { value: '3m',  label: '3M'  },
  { value: 'ytd', label: 'YTD' },
  { value: '1y',  label: '1Y'  },
  { value: 'all', label: 'ALL' },
]

const VIEW_MODES: Array<{ value: AnalyticsViewMode; label: string }> = [
  { value: 'dashboard',  label: 'Overview'    },
  { value: 'deep-dive',  label: 'Deep Dive'   },
  { value: 'comparison', label: 'Compare'     },
  { value: 'signal-map', label: 'Signal Map'  },
]

export function AnalyticsFilters({ className }: AnalyticsFiltersProps) {
  const {
    activeTimeframe, setTimeframe,
    viewMode, setViewMode,
    showNormalized, toggleNormalized,
    showInstBreakdown, toggleInstBreakdown,
    resetFilters,
  } = useAnalyticsStore()

  return (
    <div className={cn('flex flex-col gap-2', className)}>

      {/* Row 1: timeframe + view mode + toggles */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Timeframe selector */}
        <div
          className="flex items-center rounded-md overflow-hidden"
          style={{ border: '1px solid var(--probex-border-default)' }}
          role="group"
          aria-label="Analytics timeframe"
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
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* View mode */}
        <div
          className="flex items-center rounded-md overflow-hidden"
          style={{ border: '1px solid var(--probex-border-default)' }}
          role="group"
          aria-label="Analytics view mode"
        >
          {VIEW_MODES.map((vm, idx) => (
            <button
              key={vm.value}
              onClick={() => setViewMode(vm.value)}
              aria-pressed={viewMode === vm.value}
              className="text-xs font-semibold px-3 py-1.5 cursor-pointer transition-all duration-100"
              style={{
                background:  viewMode === vm.value ? 'var(--probex-surface-2)' : 'transparent',
                color:       viewMode === vm.value ? 'var(--probex-text-primary)' : 'var(--probex-text-muted)',
                borderRight: idx < VIEW_MODES.length - 1 ? '1px solid var(--probex-border-default)' : 'none',
              }}
            >
              {vm.label}
            </button>
          ))}
        </div>

        {/* Toggles */}
        <ToggleButton
          label="Inst. Breakdown"
          active={showInstBreakdown}
          onClick={toggleInstBreakdown}
          aria-label="Toggle institutional vs retail breakdown"
        />
        <ToggleButton
          label="Normalized"
          active={showNormalized}
          onClick={toggleNormalized}
          aria-label="Toggle normalized values"
        />

        {/* Reset */}
        <button
          onClick={resetFilters}
          className="text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-100 ml-auto"
          style={{ color: 'var(--probex-text-muted)', border: '1px solid var(--probex-border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--probex-text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--probex-text-muted)' }}
        >
          Reset
        </button>

      </div>
    </div>
  )
}

function ToggleButton({
  label, active, onClick, 'aria-label': ariaLabel,
}: {
  label:       string
  active:      boolean
  onClick:     () => void
  'aria-label': string
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className="text-xs font-medium px-2.5 py-1.5 rounded-md cursor-pointer transition-all duration-100 border"
      style={active ? {
        background:  'var(--probex-primary-dim)',
        color:       'var(--probex-primary)',
        borderColor: 'var(--probex-yes-border)',
      } : {
        background:  'transparent',
        color:       'var(--probex-text-muted)',
        borderColor: 'var(--probex-border)',
      }}
    >
      {label}
    </button>
  )
}
