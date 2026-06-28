'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ResearchCategoryId,
  ResearchFormat,
  ResearchSentiment,
  ResearchFilters,
} from '@/types/research'
import type { ReportId }       from '@/types/branded'
import type { ConfidenceLevel } from '@/types/consensus'
import type { BitcoinSegment } from '@/types/market'

// ─── State ────────────────────────────────────────────────────────────────

export type ResearchSortField = 'publishedAt' | 'confidence' | 'readTime'

interface ResearchStoreState {
  /** Full-text search query */
  searchQuery:      string
  /** Active category filter — null = all categories */
  activeCategory:   ResearchCategoryId | null
  /** Format filter — null = all formats */
  formatFilter:     ResearchFormat | null
  /** Sentiment filter — null = all sentiments */
  sentimentFilter:  ResearchSentiment | null
  /** Confidence filter — null = all confidence levels */
  confidenceFilter: ConfidenceLevel | null
  /** Segment filter — null = all segments */
  segmentFilter:    BitcoinSegment | null
  /** Active report being read (displayed in detail view) */
  activeReportId:   ReportId | null
  /** Sort field */
  sortBy:           ResearchSortField
  /** Sort direction */
  sortDir:          'asc' | 'desc'
  /** Report IDs that the user has bookmarked / saved */
  savedReportIds:   ReportId[]
  /** Report IDs that the user has read */
  readReportIds:    ReportId[]
  /** Whether the detail panel is expanded */
  isDetailOpen:     boolean
}

// ─── Actions ─────────────────────────────────────────────────────────────

interface ResearchStoreActions {
  setSearch:          (q: string)                          => void
  setCategory:        (cat: ResearchCategoryId | null)     => void
  setFormat:          (fmt: ResearchFormat | null)          => void
  setSentiment:       (s: ResearchSentiment | null)         => void
  setConfidence:      (c: ConfidenceLevel | null)           => void
  setSegment:         (seg: BitcoinSegment | null)          => void
  setSort:            (field: ResearchSortField, dir?: 'asc' | 'desc') => void

  openReport:         (id: ReportId)   => void
  closeReport:        ()                => void

  saveReport:         (id: ReportId)   => void
  unsaveReport:       (id: ReportId)   => void
  toggleSave:         (id: ReportId)   => void

  markRead:           (id: ReportId)   => void
  markAllRead:        ()                => void

  resetFilters:       ()                => void

  /** Derive a ResearchFilters object for service calls */
  getFilters:         () => ResearchFilters

 // ─── aliases (matching component API) ─────────────────────────
  setSearchQuery:     (q: string)                          => void
  setFormatFilter:    (fmt: ResearchFormat | null)          => void
  setSentimentFilter: (s: ResearchSentiment | null)         => void
  setConfidenceFilter:(c: ConfidenceLevel | null)           => void
  setSegmentFilter:   (seg: BitcoinSegment | null)          => void
  setSortBy:          (field: ResearchSortField)            => void
  setSortDir:         (dir: 'asc' | 'desc')                 => void
}

type ResearchStore = ResearchStoreState & ResearchStoreActions

// ─── Defaults ─────────────────────────────────────────────────────────────

const DEFAULT_STATE: ResearchStoreState = {
  searchQuery:      '',
  activeCategory:   null,
  formatFilter:     null,
  sentimentFilter:  null,
  confidenceFilter: null,
  segmentFilter:    null,
  activeReportId:   null,
  sortBy:           'publishedAt',
  sortDir:          'desc',
  savedReportIds:   [],
  readReportIds:    [],
  isDetailOpen:     false,
}

// ─── Store ────────────────────────────────────────────────────────────────

export const useResearchStore = create<ResearchStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setSearch:     (q)    => set({ searchQuery: q }),
      setCategory:   (cat)  => set({ activeCategory: cat }),
      setFormat:     (fmt)  => set({ formatFilter: fmt }),
      setSentiment:  (s)    => set({ sentimentFilter: s }),
      setConfidence: (c)    => set({ confidenceFilter: c }),
      setSegment:    (seg)  => set({ segmentFilter: seg }),

      setSort: (field, dir) => set((s) => ({
        sortBy:  field,
        sortDir: dir ?? (s.sortBy === field && s.sortDir === 'desc' ? 'asc' : 'desc'),
      })),

      openReport:  (id) => set({ activeReportId: id, isDetailOpen: true }),
      closeReport: ()   => set({ activeReportId: null, isDetailOpen: false }),

      saveReport:   (id) => set((s) => ({
        savedReportIds: s.savedReportIds.includes(id)
          ? s.savedReportIds
          : [...s.savedReportIds, id],
      })),

      unsaveReport: (id) => set((s) => ({
        savedReportIds: s.savedReportIds.filter((r) => r !== id),
      })),

      toggleSave: (id) => {
        const { savedReportIds, saveReport, unsaveReport } = get()
        savedReportIds.includes(id) ? unsaveReport(id) : saveReport(id)
      },

      markRead: (id) => set((s) => ({
        readReportIds: s.readReportIds.includes(id)
          ? s.readReportIds
          : [...s.readReportIds, id],
      })),

      markAllRead: () => {
 // UI: call this when user visits the research page
        // For now, mark all known reports read
      },

      resetFilters: () => set({
        searchQuery:      '',
        activeCategory:   null,
        formatFilter:     null,
        sentimentFilter:  null,
        confidenceFilter: null,
        segmentFilter:    null,
        sortBy:           'publishedAt',
        sortDir:          'desc',
      }),

 // ─── alias methods ──────────────────────────────────────────
      setSearchQuery:     (q)    => set({ searchQuery: q }),
      setFormatFilter:    (fmt)  => set({ formatFilter: fmt }),
      setSentimentFilter: (s)    => set({ sentimentFilter: s }),
      setConfidenceFilter:(c)    => set({ confidenceFilter: c }),
      setSegmentFilter:   (seg)  => set({ segmentFilter: seg }),
      setSortBy:          (field)=> set({ sortBy: field }),
      setSortDir:         (dir)  => set({ sortDir: dir }),

      getFilters: (): ResearchFilters => {
        const s = get()
        return {
          categoryId:  s.activeCategory  ?? undefined,
          format:      s.formatFilter    ?? undefined,
          sentiment:   s.sentimentFilter ?? undefined,
          confidence:  s.confidenceFilter ?? undefined,
          segment:     s.segmentFilter   ?? undefined,
          search:      s.searchQuery     || undefined,
          sortBy:      s.sortBy,
          sortDir:     s.sortDir,
        }
      },
    }),
    {
      name:    'probex-research',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        // Persist user-generated state only
        savedReportIds: s.savedReportIds,
        readReportIds:  s.readReportIds,
        sortBy:         s.sortBy,
        sortDir:        s.sortDir,
      }),
    },
  ),
)

// ─── Selector hooks ────────────────────────────────────────────────────────

export const useResearchSearch     = () => useResearchStore((s) => s.searchQuery)
export const useActiveCategory     = () => useResearchStore((s) => s.activeCategory)
export const useActiveReportId     = () => useResearchStore((s) => s.activeReportId)
export const useIsReportDetailOpen = () => useResearchStore((s) => s.isDetailOpen)
export const useSavedReportIds     = () => useResearchStore((s) => s.savedReportIds)
export const useReadReportIds      = () => useResearchStore((s) => s.readReportIds)
export const useResearchFilters    = () => useResearchStore((s) => s.getFilters())
