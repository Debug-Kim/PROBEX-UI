'use client'

// Global right-hand slide-over that surfaces the platform Activity Feed from
// anywhere. Reuses the existing ActivityFeed component — no feed logic is
// duplicated. Mounted once in DashboardLayout.

import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

export function ActivityDrawer() {
  const open  = useUIStore((s) => s.activityOpen)
  const close = useUIStore((s) => s.closeActivity)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <div aria-hidden={!open} style={{ pointerEvents: open ? 'auto' : 'none' }}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity duration-200"
        style={{ zIndex: 70, background: 'rgba(0,0,0,0.5)', opacity: open ? 1 : 0 }}
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal={open}
        aria-label="Global activity feed"
        className="fixed top-0 right-0 h-full flex flex-col transition-transform duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ zIndex: 71, width: 360, maxWidth: '92vw', transform: open ? 'translateX(0)' : 'translateX(100%)', background: 'var(--probex-bg)', borderLeft: '1px solid var(--probex-border)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--probex-border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--probex-text-primary)' }}>Activity</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close activity feed"
            className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors duration-100"
            style={{ color: 'var(--probex-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--probex-text-primary)'; e.currentTarget.style.background = 'var(--probex-surface-2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--probex-text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-3">
          <ActivityFeed className="h-full" />
        </div>
      </aside>
    </div>
  )
}
