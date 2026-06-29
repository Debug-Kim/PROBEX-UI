'use client'

// Research Terminal left-nav: category list, latest/saved reports, and signal-alert
// counts. Selection drives researchStore (activeCategory / openReport).

import { cn }                 from '@/lib/utils'
import { useResearchStore }   from '@/store/researchStore'
import { MOCK_RESEARCH_REPORTS, RESEARCH_CATEGORIES } from '@/mock/research'
import { ResearchReportCard } from './ResearchReportCard'
import type { ResearchCategoryId } from '@/types/research'

interface ResearchSidebarProps {
  className?: string
}

export function ResearchSidebar({ className }: ResearchSidebarProps) {
  const {
    activeCategory, setCategory,
    savedReportIds, openReport,
  } = useResearchStore()

  // Derive counts from mock data
  const countsByCategory = RESEARCH_CATEGORIES.reduce<Record<ResearchCategoryId, number>>(
    (acc, cat) => {
      acc[cat.id] = MOCK_RESEARCH_REPORTS.filter((r) => r.categoryId === cat.id).length
      return acc
    },
    {} as Record<ResearchCategoryId, number>,
  )

  const recentReports = [...MOCK_RESEARCH_REPORTS]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 4)

  const savedReports = MOCK_RESEARCH_REPORTS.filter((r) => savedReportIds.includes(r.id)).slice(0, 3)

  // Active signal counts
  const bullishSignals = MOCK_RESEARCH_REPORTS.flatMap((r) => r.signals).filter((s) => s.type === 'bullish-flag').length
  const watchSignals   = MOCK_RESEARCH_REPORTS.flatMap((r) => r.signals).filter((s) => s.type === 'watch').length

  return (
    <aside
      className={cn('flex flex-col gap-0 rounded-xl overflow-hidden', className)}
      style={{
        background: 'var(--probex-surface)',
        border:     '1px solid var(--probex-border)',
        width:      '240px',
        flexShrink: 0,
      }}
      aria-label="Research navigation"
    >
      {/* ── Signal alerts summary ──────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid var(--probex-border)', background: 'var(--probex-surface-2)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="live-dot" aria-hidden="true" />
          <span className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-primary)' }}>
            Active Signals
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-2xs">
          <span className="font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--probex-positive-dim)', color: 'var(--probex-positive)' }}>
            {bullishSignals} ↑
          </span>
          <span className="font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--probex-warning)' }}>
            {watchSignals} ◎
          </span>
        </div>
      </div>

      {/* ── Categories ────────────────────────────────────────── */}
      <div className="py-2">
        <p className="px-4 py-1.5 text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-disabled)' }}>
          Categories
        </p>
        <nav role="navigation" aria-label="Research categories">
          {/* All */}
          <SidebarNavItem
            icon="📚"
            label="All Research"
            count={MOCK_RESEARCH_REPORTS.length}
            isActive={activeCategory === null}
            onClick={() => setCategory(null)}
          />
          {RESEARCH_CATEGORIES.map((cat) => (
            <SidebarNavItem
              key={cat.id}
              icon={cat.iconLabel}
              label={cat.label}
              count={countsByCategory[cat.id] ?? 0}
              isActive={activeCategory === cat.id}
              onClick={() => setCategory(activeCategory === cat.id ? null : cat.id)}
            />
          ))}
        </nav>
      </div>

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="divider" />

      {/* ── Latest ────────────────────────────────────────────── */}
      <div className="py-2">
        <p className="px-4 py-1.5 text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-disabled)' }}>
          Latest
        </p>
        <div>
          {recentReports.map((report) => (
            <ResearchReportCard
              key={report.id as string}
              report={report}
              variant="compact"
              onClick={() => openReport(report.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Saved ─────────────────────────────────────────────── */}
      {savedReports.length > 0 && (
        <>
          <div className="divider" />
          <div className="py-2">
            <p className="px-4 py-1.5 text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-disabled)' }}>
              Saved ({savedReports.length})
            </p>
            <div>
              {savedReports.map((report) => (
                <ResearchReportCard
                  key={report.id as string}
                  report={report}
                  variant="compact"
                  onClick={() => openReport(report.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  )
}

// ─── Sidebar nav item ─────────────────────────────────────────────────────

function SidebarNavItem({
  icon, label, count, isActive, onClick,
}: {
  icon:     string
  label:    string
  count:    number
  isActive: boolean
  onClick:  () => void
}) {
  return (
    <button
      onClick={onClick}
      role="menuitem"
      className="flex items-center gap-2.5 w-full px-4 py-2 text-left cursor-pointer transition-colors duration-100"
      style={isActive ? {
        background: 'var(--probex-primary-dim)',
        color:      'var(--probex-primary)',
      } : {
        background: 'transparent',
        color:      'var(--probex-text-secondary)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'var(--probex-surface-2)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent'
      }}
    >
      <span className="text-sm flex-shrink-0" aria-hidden="true">{icon}</span>
      <span className="text-xs font-medium flex-1 truncate">{label}</span>
      {count > 0 && (
        <span
          className="text-2xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: isActive ? 'var(--probex-primary)' : 'var(--probex-surface-3)',
            color:      isActive ? '#050816' : 'var(--probex-text-muted)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}
