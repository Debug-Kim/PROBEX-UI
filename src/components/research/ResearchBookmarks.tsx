'use client'

// Displays the user's saved / bookmarked research reports.
// Used as a dedicated section on the Research Terminal or as a sidebar widget.
//
// Sections:
//   1. Saved reports list  — compact ResearchReportCard rows
//   2. Read history count  — "You've read X of Y reports" progress indicator
//   3. Empty state         — when no reports are saved
//
// All state from researchStore:
//   savedReportIds  → which reports are bookmarked
//   readReportIds   → which reports have been opened/marked-read
//   unsaveReport    → called by each card's save button
//   openReport      → opens the report in ResearchReader

import { cn }               from '@/lib/utils'
import { useResearchStore } from '@/store/researchStore'
import { useResearchReports } from '@/hooks/useServices'
import { ResearchReportCard } from './ResearchReportCard'

interface ResearchBookmarksProps {
  className?: string
}

export function ResearchBookmarks({ className }: ResearchBookmarksProps) {
  const { savedReportIds, readReportIds, openReport } = useResearchStore()
  const reports = useResearchReports().data?.data ?? []

  const savedReports = reports.filter((r) => savedReportIds.includes(r.id))
  const readCount    = reports.filter((r) => readReportIds.includes(r.id)).length
  const totalCount   = reports.length
  const readPct      = totalCount > 0 ? (readCount / totalCount) * 100 : 0

  return (
    <div
      className={cn('rounded-xl overflow-hidden', className)}
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--probex-border)' }}
      >
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>
          Saved Reports
        </h2>
        <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>
          {savedReports.length} saved
        </span>
      </div>

      {/* Reading progress */}
      <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--probex-border)', background: 'var(--probex-surface-2)' }}>
        <div className="flex items-center justify-between text-2xs mb-1" style={{ color: 'var(--probex-text-muted)' }}>
          <span>Reading progress</span>
          <span>{readCount} / {totalCount} reports read</span>
        </div>
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--probex-border-default)' }}
          role="progressbar"
          aria-valuenow={readPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${readCount} of ${totalCount} reports read`}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${readPct}%`, background: 'var(--probex-primary)' }}
          />
        </div>
      </div>

      {/* Saved list */}
      {savedReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--probex-text-muted)' }} aria-hidden="true">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--probex-text-secondary)' }}>No saved reports</p>
            <p className="text-2xs mt-1" style={{ color: 'var(--probex-text-muted)' }}>
              Click the bookmark icon on any report to save it here
            </p>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  )
}
