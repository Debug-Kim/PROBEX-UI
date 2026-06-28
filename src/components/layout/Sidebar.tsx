'use client'

import {cn} from '@/lib/utils'
import {useSidebarCollapsed} from '@/store/sidebarStore'
import {useDerivedPermissions} from '@/hooks/useFeatureFlag'
import {ROUTES} from '@/config/constants'
import {SidebarItem}    from './SidebarItem'
import {SidebarSection} from './SidebarSection'

// ─── Inline SVG icon set (inline, no external dependency) ────────────

const Icons = {
  Overview:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>,
  Markets:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  Live:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Portfolio:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  Positions:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Watchlist:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Wallet:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  Research:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/></svg>,
  Consensus:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 1 0 5 5"/><path d="M13.5 7 22 2"/><path d="M12 12v10"/><path d="M8 16l4 4 4-4"/></svg>,
  Analytics:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="4" height="12" x="2" y="10" rx="1"/><rect width="4" height="18" x="10" y="4" rx="1"/><rect width="4" height="8" x="18" y="14" rx="1"/></svg>,
  Settings:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Admin:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>,
}

// ─── Pro / Admin badge chips ──────────────────────────────────────────────

function ProBadge() {
  return (
    <span className="badge-pro text-2xs">PRO</span>
  )
}

function AdminBadge() {
  return (
    <span className="badge-admin text-2xs">ADMIN</span>
  )
}

function LiveBadge() {
  return (
    <span
      className="flex items-center gap-1 text-2xs font-semibold rounded px-1.5 py-0.5"
      style={{
        background:   'rgba(16,185,129,0.12)',
        color:        'var(--probex-positive)',
        border:       '1px solid rgba(16,185,129,0.2)',
      }}
    >
      <span className="live-dot w-1 h-1" />
      Live
    </span>
  )
}

// ─── Main Sidebar component ───────────────────────────────────────────────

/**
 * Sidebar
 * ───────
 * Full-height collapsible navigation sidebar.
 *
 * Layout:
 *   [Logo]
 *   [Nav sections — scrollable]
 *   [Toggle button — fixed at bottom]
 *
 * Widths:
 *   Expanded:  200px  (--sidebar-expanded in tailwind.config.ts)
 *   Collapsed: 52px   (--sidebar-collapsed)
 *
 * Transition: width is animated via CSS.
 * Role awareness: Professional and Admin sections only render for eligible roles.
 */
export function Sidebar() {
  const isCollapsed = useSidebarCollapsed()
  const perms       = useDerivedPermissions()

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        'flex flex-col h-full flex-shrink-0',
        'transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        'overflow-hidden',
        isCollapsed ? 'w-[52px]' : 'w-[200px]',
      )}
      style={{
        background:   'var(--probex-sidebar-bg)',
        borderRight:  '1px solid var(--probex-border)',
      }}
    >
      {/* Dedicated navigation rail */}
      <div className="sidebar-rail flex-1 overflow-y-auto overflow-x-hidden py-2">

        {/* ── Trade ───────────────────────────────────────── */}
        <SidebarSection label="Trade">
          <SidebarItem
            href={ROUTES.HOME}
            icon={<Icons.Overview />}
            label="Overview"
          />
          <SidebarItem
            href={ROUTES.MARKETS}
            icon={<Icons.Markets />}
            label="Markets"
          />
          <SidebarItem
            href={ROUTES.PORTFOLIO}
            icon={<Icons.Portfolio />}
            label="Portfolio"
          />
          <SidebarItem
            href={ROUTES.POSITIONS}
            icon={<Icons.Positions />}
            label="Positions"
          />
        </SidebarSection>

        {/* ── Intelligence ────────────────────────────────── */}
        <SidebarSection label="Intelligence">
          <SidebarItem
            href={ROUTES.RESEARCH}
            icon={<Icons.Research />}
            label="Research"
            badge={!perms.canViewResearch && !perms.isAdmin ? <ProBadge /> : undefined}
          />
          <SidebarItem
            href={ROUTES.ANALYTICS}
            icon={<Icons.Analytics />}
            label="Analytics"
            badge={!perms.canViewAnalytics && !perms.isAdmin ? <ProBadge /> : undefined}
          />
          <SidebarItem
            href={ROUTES.CONSENSUS}
            icon={<Icons.Consensus />}
            label="Consensus"
            badge={!perms.canViewConsensus && !perms.isAdmin ? <ProBadge /> : undefined}
          />
          <SidebarItem
            href={ROUTES.LIVE}
            icon={<Icons.Live />}
            label="Live"
            badge={<LiveBadge />}
          />
        </SidebarSection>

        {/* ── Account ─────────────────────────────────────── */}
        <SidebarSection label="Account">
          <SidebarItem
            href={ROUTES.WATCHLIST}
            icon={<Icons.Watchlist />}
            label="Watchlist"
          />
          <SidebarItem
            href={ROUTES.WALLET}
            icon={<Icons.Wallet />}
            label="Wallet"
          />
        </SidebarSection>

        {/* ── Admin only ───────────────────────────────────── */}
        {perms.canViewAdmin && (
          <SidebarSection label="System">
            <SidebarItem
              href={ROUTES.ADMIN}
              icon={<Icons.Admin />}
              label="Admin Console"
              badge={<AdminBadge />}
            />
          </SidebarSection>
        )}

        {/* ── Bottom: Settings ─────────────────────────────── */}
        <div className="pt-1">
          <SidebarSection label="">
            <SidebarItem
              href={ROUTES.SETTINGS}
              icon={<Icons.Settings />}
              label="Settings"
            />
          </SidebarSection>
        </div>
      </div>
    </aside>
  )
}
