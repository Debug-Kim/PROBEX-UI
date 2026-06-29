// Single source of truth for feature flags. Consume via useFeatureFlag(), not by
// importing this directly. Each flag carries a one-line note on what it gates.

const env = (key: string): boolean =>
  typeof process !== 'undefined' &&
  process.env[key] !== undefined
    ? process.env[key] === 'true'
    : false

export const FEATURES = {
 /** real-time market stream via MockStreamProvider */
  ENABLE_REALTIME_MARKETS: env('NEXT_PUBLIC_ENABLE_REALTIME') || true,

 /** Admin Console */
  ENABLE_ADMIN_CONSOLE: true,

 /** Polygon wallet + trading */
  ENABLE_POLYGON_TRADING: false,

  // ── Feature gates consumed by useDerivedPermissions() ────────────────────
  // Built and accessible features (true); unbuilt admin features (false).
  /** Consensus Engine surfaces (page + panels) */
  CONSENSUS_ENGINE:  true,
  /** Analytics dashboard (Pro-gated by role) */
  ANALYTICS:         true,
  /** Admin console — alias of ENABLE_ADMIN_CONSOLE for permission checks */
  ADMIN_CONSOLE:     true,
  /** Live markets page */
  LIVE_MARKETS:      true,
  /** Research terminal */
  RESEARCH_TERMINAL: true,
  /** Trading panel / drawer */
  TRADING_PANEL:     true,
  /** Order book view — not yet built */
  ORDER_BOOK:        false,
  /** KYC management (admin console panel) */
  KYC_MANAGEMENT:    true,
  /** Risk dashboard (admin console panel) */
  RISK_DASHBOARD:    true,
} as const

export type FeatureKey = keyof typeof FEATURES
