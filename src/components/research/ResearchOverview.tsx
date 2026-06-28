'use client'

import { useState } from 'react'
import { useResearchStore } from '@/store'
import { MOCK_RESEARCH_REPORTS, getLatestReport } from '@/mock/research'
import { EmptyState, PageHeader } from '@/components/ui'
import { ResearchFilters } from './ResearchFilters'
import { ResearchSidebar } from './ResearchSidebar'
import { ResearchReportCard } from './ResearchReportCard'
import { ResearchReader } from './ResearchReader'
import { ResearchBookmarks } from './ResearchBookmarks'
import type { ResearchReport } from '@/types/research'

// ─── Filter + sort helper (pure, testable) ────────────────────────────────────

interface FilterOptions {
  searchQuery: string
  activeCategory: string | null
  formatFilter: string | null
  sentimentFilter: string | null
  confidenceFilter: string | null
  segmentFilter: string | null
  sortBy: 'publishedAt' | 'confidence' | 'readTime'
  sortDir: 'asc' | 'desc'
}

function filterReports(
  reports: ResearchReport[],
  opts: FilterOptions,
): ResearchReport[] {
  let result = reports.slice()

  // Search — case-insensitive against title, summary, tags
  if (opts.searchQuery.trim()) {
    const q = opts.searchQuery.toLowerCase()
    result = result.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }

  // Category
  if (opts.activeCategory) {
    result = result.filter((r) => r.category === opts.activeCategory)
  }

  // Format
  if (opts.formatFilter) {
    result = result.filter((r) => r.format === opts.formatFilter)
  }

  // Sentiment
  if (opts.sentimentFilter) {
    result = result.filter((r) => r.sentiment === opts.sentimentFilter)
  }

  // Confidence
  if (opts.confidenceFilter) {
    result = result.filter((r) => r.confidence === opts.confidenceFilter)
  }

  // Segment
  if (opts.segmentFilter) {
    result = result.filter(
      (r) =>
        r.segment === opts.segmentFilter ||
        (r.segments ?? []).some((s) => s === opts.segmentFilter),
    )
  }

  // Sort
  result.sort((a, b) => {
    let aVal: number | string
    let bVal: number | string

    switch (opts.sortBy) {
      case 'publishedAt':
        aVal = new Date(a.publishedAt).getTime()
        bVal = new Date(b.publishedAt).getTime()
        break
      case 'confidence':
        // Map confidence text to numeric rank
        aVal = a.confidence === 'high' ? 3 : a.confidence === 'medium' ? 2 : 1
        bVal = b.confidence === 'high' ? 3 : b.confidence === 'medium' ? 2 : 1
        break
      case 'readTime':
        aVal = a.readTime ?? 0
        bVal = b.readTime ?? 0
        break
      default:
        aVal = new Date(a.publishedAt).getTime()
        bVal = new Date(b.publishedAt).getTime()
    }

    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return opts.sortDir === 'asc' ? cmp : -cmp
  })

  return result
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

type DrawerPanel = 'categories' | 'bookmarks' | null

function MobileDrawer({
  panel,
  onClose,
}: {
  panel: DrawerPanel
  onClose: () => void
}) {
  if (!panel) return null
  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 40,
        }}
      />
      {/* Drawer */}
      <div
        role="dialog"
        aria-label={panel === 'categories' ? 'Categories' : 'Saved reports'}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'var(--probex-surface)',
          borderTop: '1px solid var(--probex-border)',
          borderRadius: '16px 16px 0 0',
          padding: '16px',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            background: 'var(--probex-border)',
            margin: '0 auto 16px',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--probex-text-primary)',
              margin: 0,
            }}
          >
            {panel === 'categories' ? 'Categories' : 'Saved Reports'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--probex-text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {panel === 'categories' && <ResearchSidebar />}
        {panel === 'bookmarks' && <ResearchBookmarks />}
      </div>
    </>
  )
}

// ─── Mobile toolbar ───────────────────────────────────────────────────────────

function MobileToolbar({
  onOpenCategories,
  onOpenBookmarks,
}: {
  onOpenCategories: () => void
  onOpenBookmarks: () => void
}) {
  const { savedReportIds } = useResearchStore()

  return (
    <div
      className="lg:hidden"
      style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
      }}
    >
      <button
        onClick={onOpenCategories}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid var(--probex-border)',
          background: 'var(--probex-surface)',
          color: 'var(--probex-text-secondary)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Categories
      </button>
      <button
        onClick={onOpenBookmarks}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid var(--probex-border)',
          background: 'var(--probex-surface)',
          color: 'var(--probex-text-secondary)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Saved
        {savedReportIds.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '8px',
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              background: 'var(--probex-primary)',
              color: '#000',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {savedReportIds.length}
          </span>
        )}
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ResearchOverview() {
  const {
    isDetailOpen,
    searchQuery,
    activeCategory,
    formatFilter,
    sentimentFilter,
    confidenceFilter,
    segmentFilter,
    sortBy,
    sortDir,
  } = useResearchStore()
  const [mobileDrawer, setMobileDrawer] = useState<DrawerPanel>(null)

  // Compute whether any filter is active (for featured card suppression)
  const hasActiveFilter =
    !!searchQuery ||
    !!activeCategory ||
    !!formatFilter ||
    !!sentimentFilter ||
    !!confidenceFilter ||
    !!segmentFilter

  // Apply filter + sort
  const filteredReports = filterReports(MOCK_RESEARCH_REPORTS, {
    searchQuery,
    activeCategory,
    formatFilter,
    sentimentFilter,
    confidenceFilter,
    segmentFilter,
    sortBy: sortBy as 'publishedAt' | 'confidence' | 'readTime',
    sortDir: sortDir as 'asc' | 'desc',
  })

  // Featured report — latest, only shown when no filters are active
  const latestReport = getLatestReport()
  const showFeatured =
    !hasActiveFilter && !isDetailOpen && latestReport !== undefined

  // Grid reports — exclude featured from grid to avoid duplication
  const gridReports = showFeatured
    ? filteredReports.filter((r) => r.id !== latestReport!.id)
    : filteredReports

  const categoryLabel = activeCategory ? ` in ${activeCategory}` : ''
  const filteredLabel = hasActiveFilter ? ' · Filtered' : ''

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <PageHeader
          title="Research"
          subtitle="Intelligence reports, deep dives, and market analysis from the Probex team."
        />
      </div>

      {/* ── Mobile toolbar (lg: hidden) ── */}
      <MobileToolbar
        onOpenCategories={() => setMobileDrawer('categories')}
        onOpenBookmarks={() => setMobileDrawer('bookmarks')}
      />

      {/* ── Filters row ── */}
      <div style={{ marginBottom: '16px' }}>
        <ResearchFilters />
      </div>

      {/* ── Three-column layout ── */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          minHeight: 0,
          flex: 1,
          alignItems: 'flex-start',
        }}
      >
        {/* ── Left sidebar (lg+) ── */}
        <aside
          className="hidden lg:block"
          style={{
            width: '240px',
            flexShrink: 0,
            position: 'sticky',
            top: '16px',
          }}
          aria-label="Research categories"
        >
          <ResearchSidebar />
        </aside>

        {/* ── Centre panel ── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {isDetailOpen ? (
            // ── Reader mode ──
            <ResearchReader />
          ) : (
            // ── Grid mode ──
            <div>
              {/* Result count */}
              {!showFeatured && (
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--probex-text-muted)',
                    marginBottom: '12px',
                  }}
                >
                  {filteredReports.length} report
                  {filteredReports.length !== 1 ? 's' : ''}
                  {categoryLabel}
                  {filteredLabel}
                </p>
              )}

              {/* Empty state */}
              {filteredReports.length === 0 && (
                <EmptyState
                  title="No reports match your filters"
                  description="Try adjusting your search or clearing some filters to find more reports."
                />
              )}

              {/* Featured card — full-width, latest report, no active filters */}
              {showFeatured && latestReport && (
                <div style={{ marginBottom: '20px' }}>
                  <ResearchReportCard
                    report={latestReport}
                    variant="featured"
                  />
                </div>
              )}

              {/* Standard grid */}
              {gridReports.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {gridReports.map((report) => (
                    <ResearchReportCard
                      key={report.id}
                      report={report}
                      variant="standard"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ── Right bookmarks panel (xl+) ── */}
        <aside
          className="hidden xl:block"
          style={{
            width: '240px',
            flexShrink: 0,
            position: 'sticky',
            top: '16px',
          }}
          aria-label="Saved reports"
        >
          <ResearchBookmarks />
        </aside>
      </div>

      {/* ── Mobile drawer ── */}
      <MobileDrawer
        panel={mobileDrawer}
        onClose={() => setMobileDrawer(null)}
      />
    </>
  )
}
