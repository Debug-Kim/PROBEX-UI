'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  AnalyticsTimeframe,
  AnalyticsViewMode,
  AnalyticsMetricId,
  OnChainMetricId,
} from '@/types/analytics'
import type { BitcoinSegment } from '@/types/market'
import type { SignalLevel }    from '@/types/consensus'

// ─── State ────────────────────────────────────────────────────────────────

export type AnalyticsTab =
  | 'overview'
  | 'consensus'
  | 'institutional'
  | 'etf'
  | 'on-chain'
  | 'market'
  | 'portfolio'

interface AnalyticsStoreState {
  /** Primary chart timeframe — controls all time-series charts on the page */
  activeTimeframe:    AnalyticsTimeframe
  /** Which analytics tab is visible */
  activeTab:          AnalyticsTab
  /** Dashboard layout mode */
  viewMode:           AnalyticsViewMode
  /** Primary metric highlighted in the dashboard */
  selectedMetric:     AnalyticsMetricId
  /** Segment filter — null = all segments */
  selectedSegment:    BitcoinSegment | null
  /** Signal strength filter — null = all signals */
  selectedSignal:     SignalLevel | null
  /** On-chain metric for deep dive */
  selectedOnChain:    OnChainMetricId | null
  /** Whether to show normalized vs raw values in charts */
  showNormalized:     boolean
  /** Whether to show institutional vs retail breakdown overlay */
  showInstBreakdown:  boolean
  /** Comparison mode: compare two timeframes side by side */
  comparisonMode:     boolean
  /** Secondary timeframe used in comparison mode */
  comparisonTimeframe: AnalyticsTimeframe | null
}

// ─── Actions ─────────────────────────────────────────────────────────────

interface AnalyticsStoreActions {
  setTimeframe:           (range: AnalyticsTimeframe)       => void
  setTab:                 (tab: AnalyticsTab)                => void
  setViewMode:            (mode: AnalyticsViewMode)          => void
  setMetric:              (metric: AnalyticsMetricId)        => void
  setSegment:             (seg: BitcoinSegment | null)       => void
  setSignal:              (signal: SignalLevel | null)        => void
  setOnChain:             (metric: OnChainMetricId | null)   => void
  toggleNormalized:       ()                                  => void
  toggleInstBreakdown:    ()                                  => void
  toggleComparisonMode:   ()                                  => void
  setComparisonTimeframe: (range: AnalyticsTimeframe | null) => void
  resetFilters:           ()                                  => void
}

type AnalyticsStore = AnalyticsStoreState & AnalyticsStoreActions

// ─── Defaults ─────────────────────────────────────────────────────────────

const DEFAULT_STATE: AnalyticsStoreState = {
  activeTimeframe:     '1m',
  activeTab:           'overview',
  viewMode:            'dashboard',
  selectedMetric:      'consensus-accuracy',
  selectedSegment:     null,
  selectedSignal:      null,
  selectedOnChain:     null,
  showNormalized:      false,
  showInstBreakdown:   true,
  comparisonMode:      false,
  comparisonTimeframe: null,
}

// ─── Store ────────────────────────────────────────────────────────────────

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setTimeframe:           (range)  => set({ activeTimeframe: range }),
      setTab:                 (tab)    => set({ activeTab: tab }),
      setViewMode:            (mode)   => set({ viewMode: mode }),
      setMetric:              (metric) => set({ selectedMetric: metric }),
      setSegment:             (seg)    => set({ selectedSegment: seg }),
      setSignal:              (signal) => set({ selectedSignal: signal }),
      setOnChain:             (metric) => set({ selectedOnChain: metric }),

      toggleNormalized:       ()       => set((s) => ({ showNormalized:    !s.showNormalized })),
      toggleInstBreakdown:    ()       => set((s) => ({ showInstBreakdown: !s.showInstBreakdown })),
      toggleComparisonMode:   ()       => set((s) => ({
        comparisonMode: !s.comparisonMode,
        // Clear comparison timeframe when toggling off
        comparisonTimeframe: s.comparisonMode ? null : s.comparisonTimeframe,
      })),

      setComparisonTimeframe: (range) => set({ comparisonTimeframe: range }),

      resetFilters: () => set({
        selectedSegment:     null,
        selectedSignal:      null,
        selectedOnChain:     null,
        comparisonMode:      false,
        comparisonTimeframe: null,
      }),
    }),
    {
      name:    'probex-analytics',
      storage: createJSONStorage(() => localStorage),
      // Persist UI preferences but not ephemeral filter state
      partialize: (s) => ({
        activeTimeframe:    s.activeTimeframe,
        activeTab:          s.activeTab,
        viewMode:           s.viewMode,
        showNormalized:     s.showNormalized,
        showInstBreakdown:  s.showInstBreakdown,
      }),
    },
  ),
)

// ─── Selector hooks ────────────────────────────────────────────────────────

export const useAnalyticsTimeframe   = () => useAnalyticsStore((s) => s.activeTimeframe)
export const useAnalyticsTab         = () => useAnalyticsStore((s) => s.activeTab)
export const useAnalyticsViewMode    = () => useAnalyticsStore((s) => s.viewMode)
export const useSelectedMetric       = () => useAnalyticsStore((s) => s.selectedMetric)
export const useAnalyticsSegment     = () => useAnalyticsStore((s) => s.selectedSegment)
export const useShowInstBreakdown    = () => useAnalyticsStore((s) => s.showInstBreakdown)
export const useComparisonMode       = () => useAnalyticsStore((s) => s.comparisonMode)
