import type { UserRole } from '@/types'
import { ROUTES } from './constants'

/**
 * Role-based access control
 * ──────────────────────────
 * Maps routes and features to minimum required roles.
 * Used by:
 *   - RoleGuard component (client-side UX gating)
 *   - layout.tsx files (server-side redirect)
 *   - usePermission() hook
 */

// ─── Route permission map ─────────────────────────────────────────────────

export const ROUTE_PERMISSIONS: Readonly<Record<string, UserRole>> = {
  [ROUTES.HOME]:       'retail',
  [ROUTES.MARKETS]:    'retail',
  [ROUTES.LIVE]:       'retail',
  [ROUTES.PORTFOLIO]:  'retail',
  [ROUTES.WATCHLIST]:  'retail',
  [ROUTES.WALLET]:     'retail',
  [ROUTES.RESEARCH]:   'retail',
  [ROUTES.SETTINGS]:   'retail',
  [ROUTES.ANALYTICS]:  'professional',
  [ROUTES.CONSENSUS]:  'professional',
  [ROUTES.ADMIN]:      'admin',
} as const

// ─── Feature permission map ───────────────────────────────────────────────

export const FEATURE_PERMISSIONS: Readonly<Record<string, UserRole>> = {
  // Trading
  PLACE_ORDER:      'retail',
  VIEW_ORDER_BOOK:  'professional',
  EXPORT_POSITIONS: 'professional',

  // Research
  BASIC_REPORTS:    'retail',
  DEEP_RESEARCH:    'professional',
  RAW_CONSENSUS:    'admin',
  EXPORT_REPORTS:   'professional',

  // Analytics
  BASIC_ANALYTICS:  'professional',
  ADVANCED_CHARTS:  'professional',
  DATA_EXPORT:      'professional',

  // Admin
  USER_MANAGEMENT:  'admin',
  MARKET_MANAGEMENT:'admin',
  KYC_REVIEW:       'admin',
  TREASURY_VIEW:    'admin',
  SYSTEM_HEALTH:    'admin',
  AUDIT_LOGS:       'admin',
  RISK_DASHBOARD:   'admin',
  COUNTRY_POLICY:   'admin',
} as const

// ─── Sidebar navigation visibility ───────────────────────────────────────

export interface NavItemPermission {
  minRole:   UserRole
  featureFlag?: string  // Optional: also requires this feature flag
}

export const SIDEBAR_PERMISSIONS: Readonly<Record<string, NavItemPermission>> = {
  overview:   { minRole: 'retail' },
  markets:    { minRole: 'retail' },
  live:       { minRole: 'retail', featureFlag: 'LIVE_MARKETS' },
  portfolio:  { minRole: 'retail' },
  watchlist:  { minRole: 'retail' },
  wallet:     { minRole: 'retail' },
  research:   { minRole: 'retail', featureFlag: 'RESEARCH_TERMINAL' },
  settings:   { minRole: 'retail' },
  consensus:  { minRole: 'professional', featureFlag: 'CONSENSUS_ENGINE' },
  analytics:  { minRole: 'professional', featureFlag: 'ANALYTICS' },
  admin:      { minRole: 'admin', featureFlag: 'ADMIN_CONSOLE' },
} as const
