'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useNotificationItems } from '@/hooks/useServices'
import type { NotificationItem } from '@/types/notifications'
import { NotificationCenter } from './NotificationCenter'

/**
 * NotificationBell
 * ────────────────
 * Bell trigger + Notification Center dropdown. Unread count reflects local
 * read state (mock); a real notification service swaps in behind the same UI.
 */
export function NotificationBell() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { data: notifData } = useNotificationItems()
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set<string>())

  const items = useMemo(
    () => (notifData ?? []).map(n => ({ ...n, read: n.read || readIds.has(n.id) })),
    [notifData, readIds],
  )

  const unreadCount = items.filter((n) => !n.read).length

  const markAll = () => setReadIds(new Set((notifData ?? []).map(n => n.id)))
  const openItem = (n: NotificationItem) => {
    setReadIds(prev => new Set([...prev, n.id]))
    setIsOpen(false)
    router.push(n.href)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          'focus-ring relative flex items-center justify-center w-8 h-8 rounded-md',
          'transition-colors duration-200 cursor-pointer active:scale-95',
        )}
        style={{
          background: isOpen ? 'var(--probex-primary-dim)' : 'var(--probex-surface-2)',
          border:     `1px solid ${isOpen ? 'var(--probex-border-active)' : 'var(--probex-border-default)'}`,
          color:      isOpen ? 'var(--probex-primary)' : 'var(--probex-text-secondary)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>

        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{ background: 'var(--probex-negative)', color: '#ffffff', border: '1.5px solid var(--probex-sidebar-bg)' }}
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 55 }} onClick={() => setIsOpen(false)} aria-hidden="true" />
          <NotificationCenter items={items} unread={unreadCount} onMarkAll={markAll} onOpen={openItem} />
        </>
      )}
    </div>
  )
}
