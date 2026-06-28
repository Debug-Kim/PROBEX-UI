// Theme
export {
  useThemeStore,
  useTheme,
  useSetTheme,
} from './themeStore'

// Sidebar
export {
  useSidebarStore,
  useSidebarCollapsed,
  useMobileOpen,
  useSidebarToggle,
} from './sidebarStore'

// Auth
export {
  useAuthStore,
  useCurrentUser,
  useAuthStatus,
  useIsAuthenticated,
  useUserRole,
} from './authStore'

// Market store
export {
  useMarketStore,
  useActiveSegment,
  useSearchQuery,
  useViewMode,
  useSelectedMarketId,
  useMarketFilters,
} from './marketStore'

// extended market selectors
export {
  useActiveTimeframe,
  useActiveOutcome,
  useIsTradingDrawerOpen,
  useStakeInput,
} from './marketStore'

// Portfolio store
export {
  usePortfolioStore,
  useChartTimeframe,
  usePositionsTab,
  useSelectedPositionId,
  useIsDetailPanelOpen,
  useShowConsensus,
  usePortfolioSortBy,
} from './portfolioStore'

// Wallet store
export {
  useWalletStore,
  useIsWalletConnected,
  useSelectedProvider,
  useIsConnectModalOpen,
  useActiveFundingFlow,
  useSelectedFundingMethod,
  useHideSmallBalances,
} from './walletStore'
export type { FundingFlow } from './walletStore'

// Analytics store
export {
  useAnalyticsStore,
  useAnalyticsTimeframe,
  useAnalyticsTab,
  useAnalyticsViewMode,
  useSelectedMetric,
  useAnalyticsSegment,
  useShowInstBreakdown,
  useComparisonMode,
} from './analyticsStore'
export type { AnalyticsTab } from './analyticsStore'

// Research store
export {
  useResearchStore,
  useResearchSearch,
  useActiveCategory,
  useActiveReportId,
  useIsReportDetailOpen,
  useSavedReportIds,
  useReadReportIds,
  useResearchFilters,
} from './researchStore'
export type { ResearchSortField } from './researchStore'

// Live store
export { useLiveStore } from './liveStore'
