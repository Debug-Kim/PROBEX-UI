'use client'

/**
 * NotificationCenter
 * ──────────────────
 * Dropdown panel rendered by NotificationBell. Presentational — state lives in
 * the bell so the unread badge stays in sync.
 */

import { NOTIFICATION_META, type NotificationItem } from '@/mock/notifications'

function formatAge(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)    return `${s}s`
  if (s < 3600)  return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

interface NotificationCenterProps {
  items:      NotificationItem[]
  unread:     number
  onMarkAll:  () => void
  onOpen:     (item: NotificationItem) => void
}

export function NotificationCenter({ items, unread, onMarkAll, onOpen }: NotificationCenterProps) {
  return (
    <div
      role="menu"
      aria-label="Notifications"
      className="absolute right-0 mt-2 rounded-xl overflow-hidden animate-fade-in-up"
      style={{ zIndex: 60, width: 340, maxWidth: '92vw', background: 'var(--probex-surface)', border: '1px solid var(--probex-border-default)', boxShadow: '0 16px 40px rgba(0,0,0,0.32)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--probex-text-primary)' }}>Notifications</h3>
          {unread > 0 && (
            <span className="text-2xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'var(--probex-primary-dim)', color: 'var(--probex-primary)' }}>{unread} new</span>
          )}
        </div>
        {unread > 0 && (
          <button type="button" onClick={onMarkAll} className="text-2xs font-medium cursor-pointer" style={{ color: 'var(--probex-primary)' }}>
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: 'var(--probex-text-muted)' }}>You're all caught up.</p>
        ) : items.map((n) => {
          const meta = NOTIFICATION_META[n.kind]
          return (
            <button
              key={n.id}
              type="button"
              role="menuitem"
              onClick={() => onOpen(n)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left cursor-pointer transition-colors duration-100"
              style={{ borderBottom: '1px solid var(--probex-border)', background: n.read ? 'transparent' : 'color-mix(in srgb, var(--probex-primary) 5%, transparent)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--probex-surface-2)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = n.read ? 'transparent' : 'color-mix(in srgb, var(--probex-primary) 5%, transparent)' }}
            >
              <span className="flex items-center justify-center flex-shrink-0 rounded-md" style={{ width: 26, height: 26, fontSize: 12, background: `color-mix(in srgb, ${meta.color} 14%, transparent)`, color: meta.color }} aria-hidden="true">
                {meta.icon}
              </span>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold truncate" style={{ color: 'var(--probex-text-primary)' }}>{n.title}</span>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--probex-primary)' }} aria-label="Unread" />}
                  <span className="ml-auto text-2xs flex-shrink-0" style={{ color: 'var(--probex-text-disabled)' }}>{formatAge(n.timestamp)}</span>
                </div>
                <span className="text-2xs leading-relaxed" style={{ color: 'var(--probex-text-muted)' }}>{n.body}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
