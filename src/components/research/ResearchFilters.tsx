'use client'

import type { ReactNode } from 'react'
import { useResearchStore } from '@/store'
import { ORDERED_SEGMENTS } from '@/config/marketSegments'
import type { ResearchFormat, ResearchSentiment, ResearchConfidence } from '@/types/research'

// ─── Pill button ──────────────────────────────────────────────────────────────

function Pill({
  label,
  active,
  onClick,
  color,
}: {
  label: string
  active: boolean
  onClick: () => void
  color?: string
}) {
  const activeColor = color ?? 'var(--probex-primary)'
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '5px 12px',
        borderRadius: '20px',
        border: `1px solid ${active ? activeColor : 'var(--probex-border)'}`,
        background: active ? `${activeColor}18` : 'transparent',
        color: active ? activeColor : 'var(--probex-text-secondary)',
        fontSize: '12px',
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

// ─── Select dropdown ──────────────────────────────────────────────────────────

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={placeholder}
      style={{
        padding: '6px 10px',
        borderRadius: '8px',
        border: '1px solid var(--probex-border)',
        background: 'var(--probex-surface-3)',
        color: value ? 'var(--probex-text-primary)' : 'var(--probex-text-muted)',
        fontSize: '12px',
        cursor: 'pointer',
        outline: 'none',
        minWidth: '120px',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ─── Filter row label ─────────────────────────────────────────────────────────

function FilterLabel({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--probex-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const FORMAT_OPTIONS: { value: ResearchFormat; label: string }[] = [
  { value: 'report', label: 'Report' },
  { value: 'signal-brief', label: 'Signal Brief' },
  { value: 'outlook', label: 'Outlook' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'data-brief', label: 'Data Brief' },
  { value: 'alert', label: 'Alert' },
]

const SORT_OPTIONS = [
  { value: 'publishedAt', label: 'Latest' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'readTime', label: 'Read Time' },
]

const SENTIMENT_OPTIONS: { value: ResearchSentiment; label: string; color: string }[] = [
  { value: 'bullish', label: 'Bullish', color: 'var(--probex-yes)' },
  { value: 'neutral', label: 'Neutral', color: 'var(--probex-text-muted)' },
  { value: 'bearish', label: 'Bearish', color: 'var(--probex-no)' },
]

const CONFIDENCE_OPTIONS: { value: ResearchConfidence; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'var(--probex-consensus-high)' },
  { value: 'medium', label: 'Medium', color: 'var(--probex-consensus-med)' },
  { value: 'low', label: 'Low', color: 'var(--probex-consensus-low)' },
]

export function ResearchFilters() {
  const {
    searchQuery,
    setSearchQuery,
    formatFilter,
    setFormatFilter,
    sentimentFilter,
    setSentimentFilter,
    confidenceFilter,
    setConfidenceFilter,
    segmentFilter,
    setSegmentFilter,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    activeCategory,
  } = useResearchStore()

  const isFiltered =
    !!searchQuery ||
    !!formatFilter ||
    !!sentimentFilter ||
    !!confidenceFilter ||
    !!segmentFilter ||
    !!activeCategory

  function handleClearAll() {
    setSearchQuery('')
    setFormatFilter(null)
    setSentimentFilter(null)
    setConfidenceFilter(null)
    setSegmentFilter(null)
  }

  function handleSortChange(value: string) {
    if (value === sortBy) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(value as 'publishedAt' | 'confidence' | 'readTime')
      setSortDir('desc')
    }
  }

  const segmentOptions = ORDERED_SEGMENTS.map((seg) => ({
    value: seg.id,
    label: seg.label,
  }))

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid var(--probex-border)',
        background: 'var(--probex-surface)',
      }}
    >
      {/* ── Row 1: Search + Sort + Format ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 180px',
            minWidth: '180px',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--probex-text-muted)',
              pointerEvents: 'none',
            }}
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path
              d="M21 21l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            placeholder="Search reports…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search research reports"
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              borderRadius: '8px',
              border: '1px solid var(--probex-border)',
              background: 'var(--probex-surface-3)',
              color: 'var(--probex-text-primary)',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Format */}
        <Select
          value={formatFilter ?? ''}
          onChange={(v) => setFormatFilter((v as ResearchFormat) || null)}
          options={FORMAT_OPTIONS}
          placeholder="All formats"
        />

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
            placeholder="Sort by"
          />
          <button
            onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
            aria-label={`Sort direction: ${sortDir === 'asc' ? 'ascending' : 'descending'}`}
            style={{
              padding: '6px 8px',
              borderRadius: '8px',
              border: '1px solid var(--probex-border)',
              background: 'var(--probex-surface-3)',
              color: 'var(--probex-text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              lineHeight: 1,
            }}
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Clear all — only when filters active */}
        {isFiltered && (
          <button
            onClick={handleClearAll}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid var(--probex-border)',
              background: 'transparent',
              color: 'var(--probex-text-muted)',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Row 2: Sentiment pills ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
        }}
      >
        <FilterLabel>Sentiment</FilterLabel>
        {SENTIMENT_OPTIONS.map((opt) => (
          <Pill
            key={opt.value}
            label={opt.label}
            active={sentimentFilter === opt.value}
            onClick={() =>
              setSentimentFilter(
                sentimentFilter === opt.value ? null : opt.value,
              )
            }
            color={opt.color}
          />
        ))}
      </div>

 {/* ── Row 3: Confidence filter pills ( addition) ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
        }}
      >
        <FilterLabel>Confidence</FilterLabel>
        {CONFIDENCE_OPTIONS.map((opt) => (
          <Pill
            key={opt.value}
            label={opt.label}
            active={confidenceFilter === opt.value}
            onClick={() =>
              setConfidenceFilter(
                confidenceFilter === opt.value ? null : opt.value,
              )
            }
            color={opt.color}
          />
        ))}
      </div>

 {/* ── Row 4: Segment filter ( addition) ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
        }}
      >
        <FilterLabel>Segment</FilterLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {segmentOptions.map((opt) => (
            <Pill
              key={opt.value}
              label={opt.label}
              active={segmentFilter === opt.value}
              onClick={() =>
                setSegmentFilter(
                  segmentFilter === opt.value ? null : opt.value,
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
