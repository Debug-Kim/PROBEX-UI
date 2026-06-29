'use client'

// Building blocks shared across the six admin panels so they stay visually
// consistent and DRY. All colors are CSS variables (theme-safe). No external
// chart dep here — panels that chart import Recharts directly.

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ─── Status tone → color mapping ─────────────────────────────────────────────

export type Tone = 'positive' | 'negative' | 'warning' | 'info' | 'neutral'

const TONE_COLOR: Record<Tone, { fg: string; bg: string; border: string }> = {
  positive: { fg: 'var(--probex-positive)', bg: 'var(--probex-positive-dim)', border: 'rgba(16,185,129,0.22)' },
  negative: { fg: 'var(--probex-negative)', bg: 'var(--probex-negative-dim)', border: 'rgba(239,68,68,0.22)' },
  warning:  { fg: 'var(--probex-warning)',  bg: 'var(--probex-warning-dim)',  border: 'rgba(245,158,11,0.22)' },
  info:     { fg: 'var(--probex-primary)',  bg: 'var(--probex-primary-dim)',  border: 'rgba(0,212,255,0.22)' },
  neutral:  { fg: 'var(--probex-text-muted)', bg: 'rgba(255,255,255,0.04)',   border: 'var(--probex-border-default)' },
}

/** Colored pill with a leading dot — for statuses, severities, states. */
export function StatusPill({ tone, children, dot = true }: { tone: Tone; children: ReactNode; dot?: boolean }) {
  const c = TONE_COLOR[tone]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.fg }} aria-hidden="true" />}
      {children}
    </span>
  )
}

// ─── Titled surface card ──────────────────────────────────────────────────

export function AdminCard({
  title, subtitle, right, children, className, noPadding,
}: {
  title?:     string
  subtitle?:  string
  right?:     ReactNode
  children:   ReactNode
  className?: string
  noPadding?: boolean
}) {
  return (
    <div
      className={cn('rounded-xl overflow-hidden flex flex-col', className)}
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
    >
      {title && (
        <div className="flex items-start justify-between gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
          <div className="flex flex-col gap-0.5 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>{title}</h3>
            {subtitle && <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>{subtitle}</span>}
          </div>
          {right && <div className="flex-shrink-0">{right}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4'}>{children}</div>
    </div>
  )
}

// ─── Compact KPI tile ──────────────────────────────────────────────────────

export function AdminKpi({
  label, value, delta, tone = 'info', icon,
}: {
  label: string
  value: string
  delta?: number
  tone?: Tone
  icon?: ReactNode
}) {
  const c = TONE_COLOR[tone]
  const hasDelta = delta !== undefined
  const positive = hasDelta && delta! >= 0
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>{label}</span>
        {icon && (
          <span className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: c.bg, color: c.fg }}>
            {icon}
          </span>
        )}
      </div>
      <span className="text-2xl font-bold tabular-nums leading-none" style={{ color: 'var(--probex-text-primary)' }}>{value}</span>
      {hasDelta && (
        <span className="text-2xs font-semibold" style={{ color: positive ? 'var(--probex-positive)' : 'var(--probex-negative)' }}>
          {positive ? '▲' : '▼'} {Math.abs(delta! * 100).toFixed(1)}% vs last week
        </span>
      )}
    </div>
  )
}

// ─── Responsive table wrapper ────────────────────────────────────────────────

export function TableWrap({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="data-table min-w-full" aria-label={label}>
        {children}
      </table>
    </div>
  )
}

// ─── Search input ────────────────────────────────────────────────────────────

export function SearchField({
  value, onChange, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative w-full sm:w-64">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--probex-text-muted)' }}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input-base h-9 pl-9 text-sm"
      />
    </div>
  )
}

// ─── Segmented filter (pill row) ─────────────────────────────────────────────

export function FilterPills<T extends string>({
  options, value, onChange,
}: {
  options: Array<{ id: T; label: string; count?: number }>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {options.map((opt) => {
        const active = opt.id === value
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className="text-2xs font-semibold px-2.5 py-1 rounded-md transition-colors duration-100 cursor-pointer whitespace-nowrap"
            style={{
              background: active ? 'var(--probex-primary-dim)' : 'transparent',
              color:      active ? 'var(--probex-primary)' : 'var(--probex-text-muted)',
              border:     `1px solid ${active ? 'var(--probex-primary)' : 'var(--probex-border-default)'}`,
            }}
          >
            {opt.label}
            {opt.count !== undefined && <span className="ml-1 opacity-70">{opt.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

// ─── Small action button ─────────────────────────────────────────────────────

export function MiniButton({
  children, onClick, tone = 'neutral', title,
}: {
  children: ReactNode
  onClick?: () => void
  tone?: Tone
  title?: string
}) {
  const c = TONE_COLOR[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="text-2xs font-semibold px-2 py-1 rounded-md transition-opacity duration-100 cursor-pointer hover:opacity-80"
      style={{ background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}
    >
      {children}
    </button>
  )
}
