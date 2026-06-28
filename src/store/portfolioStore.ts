'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PositionStatus, PositionSide } from '@/types/wallet'
import type { BitcoinSegment }               from '@/types/market'
import type { TimeRange }                    from '@/types/market'

// ─── State ────────────────────────────────────────────────────────────────

interface PortfolioStoreState {
  /** Chart timeframe for portfolio performance charts */
  chartTimeframe:       TimeRange
  /** Active positions tab: 'open' | 'settled' | 'all' */
  positionsTab:         'open' | 'settled' | 'all'
  /** Selected position ID for detail panel */
  selectedPositionId:   string | null
  /** Filter by side */
  sideFilter:           PositionSide | null
  /** Filter by segment */
  segmentFilter:        BitcoinSegment | null
  /** Filter by status */
  statusFilter:         PositionStatus | null
  /** Search query for positions */
  positionSearch:       string
  /** Sort field */
  sortBy:               PositionSortField
  /** Sort direction */
  sortDir:              'asc' | 'desc'
  /** Detail panel open state */
  isDetailPanelOpen:    boolean
  /** Show consensus column in positions table */
  showConsensus:        boolean
}

export type PositionSortField =
  | 'marketTitle'
  | 'unrealizedPnl'
  | 'unrealizedPnlPct'
  | 'currentValue'
  | 'costBasis'
  | 'openedAt'
  | 'side'

// ─── Actions ─────────────────────────────────────────────────────────────

interface PortfolioStoreActions {
  setChartTimeframe:     (range: TimeRange)              => void
  setPositionsTab:       (tab: 'open' | 'settled' | 'all') => void
  selectPosition:        (id: string | null)             => void
  setSideFilter:         (side: PositionSide | null)     => void
  setSegmentFilter:      (seg: BitcoinSegment | null)    => void
  setStatusFilter:       (status: PositionStatus | null) => void
  setPositionSearch:     (q: string)                     => void
  setSort:               (field: PositionSortField, dir?: 'asc' | 'desc') => void
  openDetailPanel:       (id: string)                    => void
  closeDetailPanel:      ()                               => void
  toggleConsensus:       ()                               => void
  resetFilters:          ()                               => void
}

type PortfolioStore = PortfolioStoreState & PortfolioStoreActions

// ─── Defaults ─────────────────────────────────────────────────────────────

const DEFAULT_STATE: PortfolioStoreState = {
  chartTimeframe:     '30d',
  positionsTab:       'open',
  selectedPositionId: null,
  sideFilter:         null,
  segmentFilter:      null,
  statusFilter:       null,
  positionSearch:     '',
  sortBy:             'unrealizedPnl',
  sortDir:            'desc',
  isDetailPanelOpen:  false,
  showConsensus:      true,
}

// ─── Store ────────────────────────────────────────────────────────────────

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setChartTimeframe: (range) => set({ chartTimeframe: range }),

      setPositionsTab: (tab) =>
        set({ positionsTab: tab, selectedPositionId: null, isDetailPanelOpen: false }),

      selectPosition: (id) => set({ selectedPositionId: id }),

      setSideFilter:    (side)   => set({ sideFilter: side }),
      setSegmentFilter: (seg)    => set({ segmentFilter: seg }),
      setStatusFilter:  (status) => set({ statusFilter: status }),
      setPositionSearch:(q)      => set({ positionSearch: q }),

      setSort: (field, dir) =>
        set((s) => ({
          sortBy:  field,
          sortDir: dir ?? (s.sortBy === field && s.sortDir === 'desc' ? 'asc' : 'desc'),
        })),

      openDetailPanel: (id) =>
        set({ selectedPositionId: id, isDetailPanelOpen: true }),

      closeDetailPanel: () =>
        set({ isDetailPanelOpen: false }),

      toggleConsensus: () =>
        set((s) => ({ showConsensus: !s.showConsensus })),

      resetFilters: () =>
        set({
          sideFilter:    null,
          segmentFilter: null,
          statusFilter:  null,
          positionSearch:'',
          sortBy:        'unrealizedPnl',
          sortDir:       'desc',
        }),
    }),
    {
      name:       'probex-portfolio',
      storage:    createJSONStorage(() => localStorage),
      partialize: (s) => ({
        chartTimeframe: s.chartTimeframe,
        showConsensus:  s.showConsensus,
      }),
    },
  ),
)

// ─── Selector hooks ────────────────────────────────────────────────────────

export const useChartTimeframe      = () => usePortfolioStore((s) => s.chartTimeframe)
export const usePositionsTab        = () => usePortfolioStore((s) => s.positionsTab)
export const useSelectedPositionId  = () => usePortfolioStore((s) => s.selectedPositionId)
export const useIsDetailPanelOpen   = () => usePortfolioStore((s) => s.isDetailPanelOpen)
export const useShowConsensus       = () => usePortfolioStore((s) => s.showConsensus)
export const usePortfolioSortBy     = () => usePortfolioStore((s) => ({ sortBy: s.sortBy, sortDir: s.sortDir }))
