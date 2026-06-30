'use client'

import { cn }                from '@/lib/utils'
import { usePortfolioStore } from '@/store/portfolioStore'
import { ORDERED_SEGMENTS }  from '@/config/marketSegments'
import type { AlignmentType } from '@/lib/positions/alignment'

export type PnlState = 'profit' | 'loss' | null

interface PositionFiltersProps {
  pnlState:     PnlState
  onPnlChange:  (state: PnlState) => void
  alignmentState:    AlignmentType | null
  onAlignmentChange: (a: AlignmentType | null) => void
  className?: string
}

/**
 * PositionFilters
 * ───────────────
 * Filter controls for the positions table/grid.
 * Persists segment/side/status filters via portfolioStore.
 * P&L state and consensus alignment are local-component filters
 * (passed down as props) since they're derived, not stored fields.
 */
export function PositionFilters({
  pnlState, onPnlChange, alignmentState, onAlignmentChange, className,
}: PositionFiltersProps) {
  const {
    sideFilter, segmentFilter, positionSearch,
    setSideFilter, setSegmentFilter, setPositionSearch, resetFilters,
  } = usePortfolioStore()

  const hasActiveFilter = !!(sideFilter || segmentFilter || positionSearch || pnlState || alignmentState)

  const handleReset = () => {
    resetFilters()
    onPnlChange(null)
    onAlignmentChange(null)
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>

      {/* Row 1: search + side + P&L + alignment */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ color: 'var(--probex-text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            value={positionSearch}
            onChange={(e) => setPositionSearch(e.target.value)}
            placeholder="Search positions…"
            className="input-base h-8 pl-8 pr-3 text-sm w-full"
            aria-label="Search positions"
          />
        </div>

        {/* Side filter */}
        <FilterPillGroup
          label="Side"
          value={sideFilter}
          options={[
            { value: 'yes', label: 'YES', color: 'var(--probex-yes)' },
            { value: 'no',  label: 'NO',  color: 'var(--probex-no)'  },
          ]}
          onChange={setSideFilter}
        />

        {/* P&L state */}
        <FilterPillGroup
          label="P&L"
          value={pnlState}
          options={[
            { value: 'profit', label: 'Profit', color: 'var(--probex-positive)' },
            { value: 'loss',   label: 'Loss',   color: 'var(--probex-negative)' },
          ]}
          onChange={onPnlChange}
        />

        {/* Consensus alignment */}
        <FilterPillGroup
          label="Alignment"
          value={alignmentState}
          options={[
            { value: 'aligned',   label: 'Aligned',    color: 'var(--probex-positive)' },
            { value: 'divergent', label: 'Contrarian', color: 'var(--probex-warning)'  },
          ]}
          onChange={onAlignmentChange}
        />

        {hasActiveFilter && (
          <button
            onClick={handleReset}
            className="text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-100"
            style={{ background: 'var(--probex-negative-dim)', color: 'var(--probex-negative)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Row 2: segment pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar" role="tablist" aria-label="Filter by segment">
        <SegmentPill label="All" isActive={segmentFilter === null} onClick={() => setSegmentFilter(null)} />
        {ORDERED_SEGMENTS.map((seg) => (
          <SegmentPill
            key={seg.id}
            label={seg.shortLabel}
            isActive={segmentFilter === seg.id}
            onClick={() => setSegmentFilter(segmentFilter === seg.id ? null : seg.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Filter Pill Group ─────────────────────────────────────────────────────

interface PillOption<T> {
  value: T
  label: string
  color: string
}

function FilterPillGroup<T extends string>({
  label, value, options, onChange,
}: {
  label:    string
  value:    T | null
  options:  PillOption<T>[]
  onChange: (v: T | null) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-2xs font-medium uppercase tracking-wider mr-0.5" style={{ color: 'var(--probex-text-disabled)' }}>
        {label}
      </span>
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(isActive ? null : opt.value)}
            aria-pressed={isActive}
            className="text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all duration-100 border"
            style={isActive ? {
              background:  `color-mix(in srgb, ${opt.color} 14%, transparent)`,
              borderColor: `color-mix(in srgb, ${opt.color} 30%, transparent)`,
              color:       opt.color,
            } : {
              background:  'transparent',
              borderColor: 'var(--probex-border)',
              color:       'var(--probex-text-secondary)',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Segment Pill ──────────────────────────────────────────────────────────

function SegmentPill({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all duration-120 border"
      style={isActive ? {
        background:  'var(--probex-primary-dim)',
        borderColor: 'var(--probex-yes-border)',
        color:       'var(--probex-primary)',
      } : {
        background:  'transparent',
        borderColor: 'var(--probex-border)',
        color:       'var(--probex-text-secondary)',
      }}
    >
      {label}
    </button>
  )
}
