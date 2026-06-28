'use client'

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { BitcoinSegment, MarketFilters, MarketSortField, TimeRange } from '@/types/market'

// ─── State ────────────────────────────────────────────────────────────────

interface MarketStoreState {
  /** Active segment filter — null = all segments */
  activeSegment:    BitcoinSegment | null
  /** Current search query */
  searchQuery:      string
  /** Active sort field */
  sortBy:           MarketSortField
  /** Sort direction */
  sortDir:          'asc' | 'desc'
  /** Active sentiment filter */
  sentimentFilter:  'bullish' | 'bearish' | 'neutral' | null
  /** Min consensus score filter (0–1) */
  minConsensus:     number | null
  /** View mode: grid cards or dense table */
  viewMode:         'grid' | 'table'
  /** ID of the currently highlighted/selected market */
  selectedMarketId: string | null
  /** Active chart timeframe on the market detail page */
  activeTimeframe:  TimeRange
  /** Active outcome side in the trading drawer */
  activeOutcome:    'yes' | 'no'
  /** Whether the trading drawer is open */
  isTradingDrawerOpen: boolean
  /** Stake amount in the trading drawer (USD string, allows empty/partial input) */
  stakeInput:       string
}

// ─── Actions ─────────────────────────────────────────────────────────────

interface MarketStoreActions {
  setSegment:           (segment: BitcoinSegment | null) => void
  setSearch:            (query: string) => void
  setSort:              (field: MarketSortField, dir?: 'asc' | 'desc') => void
  setSentiment:         (s: 'bullish' | 'bearish' | 'neutral' | null) => void
  setMinConsensus:      (score: number | null) => void
  setViewMode:          (mode: 'grid' | 'table') => void
  selectMarket:         (id: string | null) => void
  setTimeframe:         (range: TimeRange) => void
  setActiveOutcome:     (outcome: 'yes' | 'no') => void
  openTradingDrawer:    () => void
  closeTradingDrawer:   () => void
  toggleTradingDrawer:  () => void
  setStakeInput:        (value: string) => void
  resetFilters:         () => void
  getFilters:           () => MarketFilters
}

type MarketStore = MarketStoreState & MarketStoreActions

const DEFAULT_STATE: MarketStoreState = {
  activeSegment:       null,
  searchQuery:         '',
  sortBy:              'volume24h',
  sortDir:             'desc',
  sentimentFilter:     null,
  minConsensus:        null,
  viewMode:            'grid',
  selectedMarketId:    null,
  activeTimeframe:     '7d',
  activeOutcome:       'yes',
  isTradingDrawerOpen: true,    // open by default on market detail page
  stakeInput:          '',
}

// ─── Store ────────────────────────────────────────────────────────────────

export const useMarketStore = create<MarketStore>()((set, get) => ({
  ...DEFAULT_STATE,

  setSegment: (segment) =>
    set({ activeSegment: segment, selectedMarketId: null }),

  setSearch: (query) => set({ searchQuery: query }),

  setSort: (field, dir) =>
    set((s) => ({
      sortBy:  field,
      sortDir: dir ?? (s.sortBy === field && s.sortDir === 'desc' ? 'asc' : 'desc'),
    })),

  setSentiment:    (s)    => set({ sentimentFilter: s }),
  setMinConsensus: (score) => set({ minConsensus: score }),
  setViewMode:     (mode)  => set({ viewMode: mode }),
  selectMarket:    (id)    => set({ selectedMarketId: id }),
  setTimeframe:    (range) => set({ activeTimeframe: range }),

  setActiveOutcome: (outcome) => set({ activeOutcome: outcome }),

  openTradingDrawer:   () => set({ isTradingDrawerOpen: true }),
  closeTradingDrawer:  () => set({ isTradingDrawerOpen: false }),
  toggleTradingDrawer: () =>
    set((s) => ({ isTradingDrawerOpen: !s.isTradingDrawerOpen })),

  setStakeInput: (value) => set({ stakeInput: value }),

  resetFilters: () =>
    set({
      activeSegment:   null,
      searchQuery:     '',
      sortBy:          'volume24h',
      sortDir:         'desc',
      sentimentFilter: null,
      minConsensus:    null,
    }),

  getFilters: (): MarketFilters => {
    const s = get()
    return {
      assetClass: 'bitcoin',
      segment:    s.activeSegment ?? undefined,
      search:     s.searchQuery   || undefined,
      sortBy:     s.sortBy,
      sortDir:    s.sortDir,
      limit:      50,
    }
  },
}))

// ─── Selector hooks ───────────────────────────────────────────────────────

export const useActiveSegment       = () => useMarketStore((s) => s.activeSegment)
export const useSearchQuery         = () => useMarketStore((s) => s.searchQuery)
export const useViewMode            = () => useMarketStore((s) => s.viewMode)
export const useSelectedMarketId    = () => useMarketStore((s) => s.selectedMarketId)
export const useMarketFilters       = () => useMarketStore(useShallow((s) => s.getFilters()))
export const useActiveTimeframe     = () => useMarketStore((s) => s.activeTimeframe)
export const useActiveOutcome       = () => useMarketStore((s) => s.activeOutcome)
export const useIsTradingDrawerOpen = () => useMarketStore((s) => s.isTradingDrawerOpen)
export const useStakeInput          = () => useMarketStore((s) => s.stakeInput)
