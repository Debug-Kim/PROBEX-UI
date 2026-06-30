'use client'

import { cn, formatCurrency } from '@/lib/utils'
import { usePortfolioActivity } from '@/hooks/useServices'
import type { PortfolioActivityEvent, PortfolioEventType } from '@/types/portfolio'

const PORTFOLIO_EVENT_LABELS: Record<PortfolioEventType, string> = {
  'position-opened': 'Position Opened',
  'position-closed': 'Position Closed',
  'settlement-win':  'Settled — Win',
  'settlement-loss': 'Settled — Loss',
  'payout-received': 'Payout',
  'watchlist-added': 'Watchlist',
  'consensus-alert': 'Consensus Alert',
}

const PORTFOLIO_EVENT_COLORS: Record<PortfolioEventType, string> = {
  'position-opened': 'var(--probex-primary)',
  'position-closed': 'var(--probex-text-muted)',
  'settlement-win':  'var(--probex-positive)',
  'settlement-loss': 'var(--probex-negative)',
  'payout-received': 'var(--probex-positive)',
  'watchlist-added': 'var(--probex-warning)',
  'consensus-alert': 'var(--probex-primary)',
}

const PORTFOLIO_EVENT_ICONS: Record<PortfolioEventType, string> = {
  'position-opened': '+',
  'position-closed': '×',
  'settlement-win':  '✓',
  'settlement-loss': '✗',
  'payout-received': '$',
  'watchlist-added': '★',
  'consensus-alert': '⚡',
}

interface PortfolioActivityProps {
  className?: string
  maxItems?:  number
}

export function PortfolioActivity({ className, maxItems = 12 }: PortfolioActivityProps) {
  const events = usePortfolioActivity(maxItems).data ?? []

  return (
    <div
      className={cn('flex flex-col rounded-xl overflow-hidden', className)}
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <div className="flex items-center gap-2">
          <span className="live-dot" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>
            Portfolio Activity
          </h2>
        </div>
        <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>
          {events.length} events
        </span>
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-[420px]" role="feed" aria-label="Portfolio activity feed">
        {events.map((event, idx) => (
          <ActivityRow key={event.id} event={event} isLast={idx === events.length - 1} />
        ))}
      </div>
    </div>
  )
}

// ─── Activity Row ─────────────────────────────────────────────────────────

function ActivityRow({ event, isLast }: { event: PortfolioActivityEvent; isLast: boolean }) {
  const color = PORTFOLIO_EVENT_COLORS[event.type]
  const icon  = PORTFOLIO_EVENT_ICONS[event.type]

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 transition-colors duration-100"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--probex-border)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--probex-surface-2)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
    >
      {/* Icon */}
      <span
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5"
        style={{
          background: `color-mix(in srgb, ${color} 14%, transparent)`,
          color,
          border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
        }}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-semibold px-1.5 py-0.5 rounded whitespace-nowrap" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}>
            {PORTFOLIO_EVENT_LABELS[event.type]}
          </span>
          <span className="text-xs font-medium truncate" style={{ color: 'var(--probex-text-primary)' }}>
            {event.marketTitle}
          </span>
        </div>
        <p className="text-xs leading-snug" style={{ color: 'var(--probex-text-secondary)' }}>
          {event.description}
        </p>
      </div>

      {/* Amount + timestamp */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        {event.amount !== undefined && (
          <span
            className="text-xs font-bold tabular-nums"
            style={{ color: event.amount >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)' }}
          >
            {event.amount >= 0 ? '+' : ''}{formatCurrency(event.amount)}
          </span>
        )}
        <span className="text-2xs tabular-nums" style={{ color: 'var(--probex-text-disabled)' }}>
          {formatAge(event.timestamp)}
        </span>
      </div>
    </div>
  )
}

// ─── Age formatter ────────────────────────────────────────────────────────

function formatAge(timestamp: number): string {
  const diffS = Math.round((Date.now() - timestamp) / 1000)
  if (diffS < 60)    return `${diffS}s ago`
  if (diffS < 3600)  return `${Math.round(diffS / 60)}m ago`
  if (diffS < 86400) return `${Math.round(diffS / 3600)}h ago`
  return `${Math.round(diffS / 86400)}d ago`
}
