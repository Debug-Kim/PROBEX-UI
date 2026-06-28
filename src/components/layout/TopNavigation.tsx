'use client'

import Link                   from 'next/link'
import { cn }                 from '@/lib/utils'
import { SearchBar }          from './SearchBar'
import { NotificationBell }   from './NotificationBell'
import { UserMenu }           from './UserMenu'
import { ProbexMark }         from '@/components/ui/ProbexMark'
import { useSidebarStore, useSidebarCollapsed } from '@/store/sidebarStore'
import { useUIStore }         from '@/store/uiStore'
import { ROUTES, TOPNAV_HEIGHT } from '@/config/constants'
import { ConnectionStatusBadge } from '@/components/live/ConnectionStatusBadge'

/**
 * TopNavigation
 * ─────────────
 * Fixed-height top bar spanning the full viewport width. Carries the Probex
 * brand and the rail collapse control at the top-left (enterprise pattern),
 * the search anchor in the center, and actions + profile on the right.
 *
 * Layout (left → right):
 *   [Collapse / Menu] [Probex brand] [Search] | [Status] [Activity] [Bell] [Profile]
 */
export function TopNavigation() {
  const toggleMobile = useSidebarStore((s) => s.toggleMobile)
  const toggleRail   = useSidebarStore((s) => s.toggle)
  const isCollapsed  = useSidebarCollapsed()

  return (
    <header
      className={cn(
        'flex items-center gap-3 px-4 flex-shrink-0',
        'border-b z-topnav',
      )}
      style={{
        height:          `${TOPNAV_HEIGHT}px`,
        background:      'var(--probex-surface)',
        borderColor:     'var(--probex-border)',
      }}
      role="banner"
    >
      {/* ── Left region: collapse/menu + brand ──────────────────────── */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Mobile: open the navigation drawer */}
        <button
          onClick={toggleMobile}
          aria-label="Open navigation menu"
          className={cn(
            'focus-ring lg:hidden flex items-center justify-center w-8 h-8 rounded-md',
            'transition-colors duration-200 cursor-pointer active:scale-95',
          )}
          style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)', color: 'var(--probex-text-secondary)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        {/* Desktop: collapse / expand the navigation rail (top-left) */}
        <button
          onClick={toggleRail}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
          className={cn(
            'focus-ring hidden lg:flex items-center justify-center w-8 h-8 rounded-md',
            'transition-colors duration-200 cursor-pointer active:scale-95',
          )}
          style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)', color: 'var(--probex-text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--probex-primary)'; e.currentTarget.style.borderColor = 'var(--probex-border-active)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--probex-text-secondary)'; e.currentTarget.style.borderColor = 'var(--probex-border-default)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>

        {/* Brand lockup — Probex (always visible) */}
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2 no-underline cursor-pointer pl-0.5"
          aria-label="Probex home"
        >
          <ProbexMark size={24} />
          <span className="text-base font-bold text-gradient-brand tracking-tight hidden sm:inline">Probex</span>
        </Link>
      </div>

      {/* ── Center: search anchor ───────────────────────────────────── */}
      <div className="flex-1 flex justify-center px-2 sm:px-4">
        <SearchBar />
      </div>

      {/* ── Right region: actions → notifications → profile ─────────── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* System status (subtle) */}
        <ConnectionStatusBadge variant="dot" />

        {/* Secondary actions */}
        <ActivityButton />
        <NotificationBell />

        {/* Separator before the terminal profile element */}
        <div
          className="hidden sm:block h-5 w-px mx-1"
          style={{ background: 'var(--probex-border-default)' }}
          aria-hidden="true"
        />

        {/* Profile (terminal element of the navbar flow) */}
        <UserMenu />
      </div>
    </header>
  )
}

// ─── Activity Button ──────────────────────────────────────────────────────

/** Opens the global activity drawer (reuses ActivityFeed). */
function ActivityButton() {
  const openActivity = useUIStore((s) => s.openActivity)
  return (
    <button
      onClick={openActivity}
      aria-label="Open activity feed"
      className={cn(
        'focus-ring flex items-center justify-center w-8 h-8 rounded-md',
        'transition-colors duration-200 cursor-pointer active:scale-95',
      )}
      style={{
        background: 'var(--probex-surface-2)',
        border:     '1px solid var(--probex-border-default)',
        color:      'var(--probex-text-secondary)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--probex-primary)'; e.currentTarget.style.borderColor = 'var(--probex-border-active)' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--probex-text-secondary)'; e.currentTarget.style.borderColor = 'var(--probex-border-default)' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    </button>
  )
}

// Wallet balance / connect now lives in the Wallet module — the navbar stays
// minimal (search + actions + notifications + profile only).
