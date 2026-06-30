'use client'

// Improved visual hierarchy for market events.
// Whale trades, consensus shifts, and probability spikes stand out.

import { useMemo }                                      from 'react'
import { cn, formatCompact }                            from '@/lib/utils'
import { useActivity }                                   from '@/hooks/useServices'
import type { ActivityItem, ActivityType }               from '@/types/activity'

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  'new-position-yes':  'var(--probex-yes)',
  'new-position-no':   'var(--probex-no)',
  'market-resolved':   'var(--probex-positive)',
  'consensus-shift':   'var(--probex-primary)',
  'probability-spike': 'var(--probex-warning)',
  'large-position':    'var(--probex-positive)',
}

// ─── Event config: icon + label + importance weight ──────────────────────────

const EVENT_CONFIG: Record<ActivityType, {
  icon:       string
  label:      string
  important?: boolean
}> = {
  'new-position-yes':  { icon: '↑', label: 'YES',       important: false },
  'new-position-no':   { icon: '↓', label: 'NO',        important: false },
  'market-resolved':   { icon: '✓', label: 'Resolved',  important: true  },
  'consensus-shift':   { icon: '◈', label: 'Consensus', important: true  },
  'probability-spike': { icon: '⚡', label: 'Spike',    important: true  },
  'large-position':    { icon: '🐋', label: 'Whale',    important: true  },
}

// ─── Relative time ────────────────────────────────────────────────────────────

function formatAge(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)   return `${s}s`
  if (s < 3600) return `${Math.floor(s/60)}m`
  if (s < 86400)return `${Math.floor(s/3600)}h`
  return `${Math.floor(s/86400)}d`
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({ item }: { item: ActivityItem }) {
  const cfg       = EVENT_CONFIG[item.type]
  const color     = ACTIVITY_COLORS[item.type]
  const important = cfg?.important ?? false
  const age       = formatAge(item.timestamp)
  const isWhale   = item.type === 'large-position'
  const isSpike   = item.type === 'probability-spike'

  return (
    <div
      style={{
        display:    'flex',
        alignItems: 'flex-start',
        gap:        10,
        padding:    '9px 14px',
        borderBottom: '1px solid var(--probex-border)',
        background: important
          ? `color-mix(in srgb, ${color} 5%, var(--probex-surface))`
          : 'var(--probex-surface)',
        borderLeft: important ? `2.5px solid ${color}` : '2.5px solid transparent',
        transition: 'background 0.1s ease',
        cursor:     'default',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--probex-surface-2)')}
      onMouseLeave={e => {
        e.currentTarget.style.background = important
          ? `color-mix(in srgb, ${color} 5%, var(--probex-surface))`
          : 'var(--probex-surface)'
      }}
    >
      {/* Event icon */}
      <span
        style={{
          flexShrink:   0,
          width:        24, height: 24,
          borderRadius: isWhale ? '50%' : 5,
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          fontSize:     11,
          fontWeight:   700,
          marginTop:    1,
          background:   `color-mix(in srgb, ${color} 16%, transparent)`,
          color,
          border:       important ? `1px solid color-mix(in srgb, ${color} 30%, transparent)` : 'none',
        }}
        aria-hidden="true"
      >
        {cfg?.icon ?? '·'}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 2 }}>
          <span style={{ fontSize: 11, fontWeight: important ? 600 : 500, color: 'var(--probex-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {item.marketTitle}
          </span>
          <span style={{ fontSize: 9, color: 'var(--probex-text-muted)', flexShrink: 0 }}>{age}</span>
        </div>
        <p style={{ fontSize: 10, color: 'var(--probex-text-muted)', lineHeight: 1.4, margin: 0 }}>
          {item.description}
          {item.amount && (
            <span style={{ fontWeight: 600, color, marginLeft: 4 }}>
              ${formatCompact(item.amount)}
            </span>
          )}
          {isSpike && item.probability !== undefined && (
            <span style={{ fontWeight: 700, color, marginLeft: 4 }}>
              → {Math.round(item.probability * 100)}%
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

// ─── Feed Header ─────────────────────────────────────────────────────────────

function FeedHeader({ count, activity }: { count: number; activity: ActivityItem[] }) {
  const whales = activity.filter(a => a.type === 'large-position').length
  const shifts = activity.filter(a => a.type === 'consensus-shift').length
  return (
    <div
      style={{
        padding:     '12px 14px',
        borderBottom: '1px solid var(--probex-border)',
        flexShrink:   0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span className="live-dot" aria-hidden="true" style={{ width: 6, height: 6 }}/>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--probex-text-primary)', margin: 0 }}>
            Live Activity
          </h3>
        </div>
        <span style={{ fontSize: 10, color: 'var(--probex-text-muted)' }}>{count} events</span>
      </div>
      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 6 }}>
        {whales > 0 && (
          <span style={{ fontSize: 9, fontWeight: 700, color: '#F97316', background: 'rgba(249,115,22,0.1)', padding: '2px 7px', borderRadius: 99, border: '1px solid rgba(249,115,22,0.2)' }}>
            🐋 {whales} whale
          </span>
        )}
        {shifts > 0 && (
          <span style={{ fontSize: 9, fontWeight: 700, color: '#8B5CF6', background: 'rgba(139,92,246,0.1)', padding: '2px 7px', borderRadius: 99, border: '1px solid rgba(139,92,246,0.2)' }}>
            ◈ {shifts} shift
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ActivityFeed({ className }: { className?: string }) {
  const activity = useActivity().data ?? []
  // Sort: important events first, then by recency
  const sorted = useMemo(() =>
    [...activity].sort((a, b) => {
      const ai = EVENT_CONFIG[a.type]?.important ? 1 : 0
      const bi = EVENT_CONFIG[b.type]?.important ? 1 : 0
      if (ai !== bi) return bi - ai
      return b.timestamp - a.timestamp
    }),
    [activity],
  )

  return (
    <div
      className={cn('flex flex-col overflow-hidden', className)}
      style={{
        background:          'var(--probex-surface)',
        border:              '1px solid var(--probex-border)',
        borderRadius:        10,
        backdropFilter:      'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <FeedHeader count={sorted.length} activity={activity} />
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {sorted.map(item => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
