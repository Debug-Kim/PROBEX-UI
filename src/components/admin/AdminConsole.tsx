'use client'

/**
 * Admin Console
 *
 * KPI header + keyboard-accessible tab bar across the six admin panels.
 * The active tab is deep-linked via the URL hash (e.g. #risk).
 */

import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useAdminKPIs } from '@/hooks/useServices'
import { AdminKpi } from './shared'
import { UserManagement }   from './UserManagement'
import { MarketManagement } from './MarketManagement'
import { AuditLogs }        from './AuditLogs'
import { RiskDashboard }    from './RiskDashboard'
import { KYCReview }        from './KYCReview'
import { SystemHealth }     from './SystemHealth'

type TabId = 'users' | 'markets' | 'audit' | 'risk' | 'kyc' | 'health'

const TABS: Array<{ id: TabId; label: string; icon: ReactNode }> = [
  { id: 'users',   label: 'Users',        icon: <UsersIcon /> },
  { id: 'markets', label: 'Markets',      icon: <ChartIcon /> },
  { id: 'kyc',     label: 'KYC Review',   icon: <ShieldIcon /> },
  { id: 'risk',    label: 'Risk',         icon: <AlertIcon /> },
  { id: 'audit',   label: 'Audit Log',    icon: <LogIcon /> },
  { id: 'health',  label: 'System Health', icon: <PulseIcon /> },
]

const ALL_IDS = TABS.map((t) => t.id)

function renderPanel(id: TabId) {
  switch (id) {
    case 'users':   return <UserManagement />
    case 'markets': return <MarketManagement />
    case 'kyc':     return <KYCReview />
    case 'risk':    return <RiskDashboard />
    case 'audit':   return <AuditLogs />
    case 'health':  return <SystemHealth />
  }
}

export function AdminConsole() {
  const [active, setActive] = useState<TabId>('users')
  const kpis = useAdminKPIs().data

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as TabId
    if (ALL_IDS.includes(hash)) setActive(hash)
  }, [])

  const select = (id: TabId) => {
    setActive(id)
    if (typeof window !== 'undefined') window.history.replaceState(null, '', `#${id}`)
  }

  return (
    <div className="page-container-wide">
      {/* Header */}
      <header className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--probex-text-primary)' }}>Admin Console</h1>
            <span className="badge-admin">ADMIN</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--probex-text-muted)' }}>
            Platform operations — users, markets, compliance, risk, and infrastructure.
          </p>
        </div>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <AdminKpi label="Total Users"      value={kpis ? kpis.totalUsers.toLocaleString() : '–'} tone="info"     icon={<UsersIcon />} />
        <AdminKpi label="Active Markets"   value={kpis ? String(kpis.activeMarkets) : '–'}       tone="positive" icon={<ChartIcon />} />
        <AdminKpi label="Pending KYC"      value={kpis ? String(kpis.pendingKyc) : '–'}          tone="warning"  icon={<ShieldIcon />} />
        <AdminKpi label="Open Risk Alerts" value={kpis ? String(kpis.openRiskAlerts) : '–'}      tone="negative" icon={<AlertIcon />} />
      </div>

      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Admin sections"
        className="flex items-center gap-1 mb-5 overflow-x-auto no-scrollbar pb-px"
        style={{ borderBottom: '1px solid var(--probex-border)' }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => select(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors duration-100 -mb-px border-b-2',
              )}
              style={{
                color:       isActive ? 'var(--probex-primary)' : 'var(--probex-text-muted)',
                borderColor: isActive ? 'var(--probex-primary)' : 'transparent',
              }}
            >
              <span className="opacity-80">{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Active panel */}
      <section role="tabpanel" aria-live="polite" className="animate-fade-in-up">
        {renderPanel(active)}
      </section>
    </div>
  )
}

// ─── Tab icons (14px) ─────────────────────────────────────────────────────────

function UsersIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
}
function ChartIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
}
function ShieldIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
}
function AlertIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
}
function LogIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
}
function PulseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
}
