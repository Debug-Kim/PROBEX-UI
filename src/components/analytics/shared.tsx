'use client'

// Shared building blocks for the Analytics module (cards, headers, tooltip, table
// cells, timeframe slicing, chart tokens) — keeps every domain panel consistent.
// All colors are CSS variables, never hardcoded hex, to preserve theming.

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { AnalyticsTimeframe } from '@/types/analytics'

// ─── Timeframe windowing ────────────────────────────────────────────────────
// The mock generators return one point per day from mid-Jan 2026 → today.
// Map each timeframe to a trailing-day window so the control actually filters.

const TF_DAYS: Record<AnalyticsTimeframe, number> = {
  '1h':  2,
  '4h':  2,
  '1d':  2,
  '1w':  7,
  '1m':  30,
  '3m':  90,
  '1y':  365,
  'ytd': 400,
  'all': 100_000,
}

export function sliceByTimeframe<T>(points: T[], tf: AnalyticsTimeframe): T[] {
  const days = TF_DAYS[tf] ?? 30
  if (days >= points.length) return points
  return points.slice(-days)
}

export function axisDateLabel(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── Chart tokens ───────────────────────────────────────────────────────────

export const CHART = {
  primary:   'var(--probex-primary)',
  secondary: 'var(--probex-chart-secondary)',
  tertiary:  'var(--probex-chart-tertiary)',
  positive:  'var(--probex-positive)',
  negative:  'var(--probex-negative)',
  warning:   'var(--probex-warning)',
  muted:     'var(--probex-text-muted)',
  grid:      'var(--probex-chart-grid)',
  bg:        'var(--probex-bg)',
} as const

export const AXIS_TICK = { fontSize: 10, fill: 'var(--probex-text-disabled)' } as const

// ─── Card + header ──────────────────────────────────────────────────────────

export function AnalyticsCard({
  title, subtitle, right, children, className,
}: {
  title:      string
  subtitle?:  string
  right?:     ReactNode
  children:   ReactNode
  className?: string
}) {
  return (
    <div
      className={cn('rounded-xl overflow-hidden flex flex-col', className)}
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
    >
      <div className="flex items-start justify-between gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>{title}</h3>
          {subtitle && <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>{subtitle}</span>}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export function SectionHeader({
  label, timeframe, primary, right,
}: {
  label:      string
  timeframe:  string
  primary?:   boolean
  right?:     ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      {primary && <span className="live-dot" aria-hidden="true" />}
      <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: primary ? 'var(--probex-primary)' : 'var(--probex-text-primary)' }}>
        {label}
      </h2>
      <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>{timeframe.toUpperCase()} view</span>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  )
}

// ─── Reusable Recharts tooltip ──────────────────────────────────────────────

interface TooltipEntry {
  value?:   number
  name?:    string
  dataKey?: string | number
  color?:   string
  stroke?:  string
  fill?:    string
}

export function SeriesTooltip({
  active, payload, label, fmt, labelMap,
}: {
  active?:   boolean
  payload?:  TooltipEntry[]
  label?:    string
  fmt?:      (v: number) => string
  labelMap?: Record<string, string>
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      className="px-3 py-2 rounded-md text-xs flex flex-col gap-1"
      style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)' }}
    >
      {label !== undefined && <span style={{ color: 'var(--probex-text-muted)' }}>{label}</span>}
      {payload.map((p, i) => {
        const key   = String(p.dataKey ?? p.name ?? i)
        const color = p.color ?? p.stroke ?? p.fill ?? 'var(--probex-text-secondary)'
        const name  = labelMap?.[key] ?? key
        const text  = p.value === undefined ? '—' : fmt ? fmt(p.value) : String(p.value)
        return (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />
            <span className="capitalize" style={{ color: 'var(--probex-text-secondary)' }}>{name}</span>
            <span className="font-semibold ml-auto" style={{ color }}>{text}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Table primitives ───────────────────────────────────────────────────────

export function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th style={{
      padding:       '8px 12px',
      textAlign:     right ? 'right' : 'left',
      fontSize:      10,
      fontWeight:    700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color:         'var(--probex-text-muted)',
      whiteSpace:    'nowrap',
    }}>
      {children}
    </th>
  )
}

export function Td({
  children, right, strong, muted, color,
}: {
  children: ReactNode
  right?:   boolean
  strong?:  boolean
  muted?:   boolean
  color?:   string
}) {
  return (
    <td style={{
      padding:            '10px 12px',
      textAlign:          right ? 'right' : 'left',
      fontSize:           13,
      fontVariantNumeric: 'tabular-nums',
      fontWeight:         strong ? 700 : 500,
      color:              color ?? (muted ? 'var(--probex-text-muted)' : 'var(--probex-text-secondary)'),
      whiteSpace:         'nowrap',
    }}>
      {children}
    </td>
  )
}
