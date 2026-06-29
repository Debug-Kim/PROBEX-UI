'use client'

import { FEATURES, type FeatureKey } from '@/config/features'
import { useUserRole } from '@/store/authStore'
import { hasPermission } from '@/types/user'
import type { UserRole } from '@/types/user'

// The single entry point for flag checks — components go through this hook
// instead of importing FEATURES, so the source (remote flags, A/B, role
// overrides) can change without touching callsites.
export function useFeatureFlag(flag: FeatureKey): boolean {
  return FEATURES[flag]
}

/** True if the current user meets the minimum role requirement. */
export function usePermission(requiredRole: UserRole): boolean {
  const userRole = useUserRole()
  return hasPermission(userRole, requiredRole)
}

/** Combined check — flag enabled AND user role sufficient. */
export function useFeatureAccess(
  flag:         FeatureKey,
  requiredRole: UserRole = 'retail',
): boolean {
  const flagEnabled = useFeatureFlag(flag)
  const hasRole     = usePermission(requiredRole)
  return flagEnabled && hasRole
}

/** All derived permissions for the current user — prefer over many individual calls. */
export function useDerivedPermissions() {
  const role = useUserRole()
  const isPro   = hasPermission(role, 'professional')
  const isAdmin = hasPermission(role, 'admin')

  return {
    // Navigation
    canViewConsensus:    isPro  && FEATURES.CONSENSUS_ENGINE,
    canViewAnalytics:    isPro  && FEATURES.ANALYTICS,
    canViewAdmin:        isAdmin && FEATURES.ADMIN_CONSOLE,
    canViewLive:         FEATURES.LIVE_MARKETS,
    canViewResearch:     FEATURES.RESEARCH_TERMINAL,

    // Trading
    canTrade:            FEATURES.TRADING_PANEL,
    canViewOrderBook:    isPro && FEATURES.ORDER_BOOK,

    // Research
    canExportReports:    isPro,
    canViewRawConsensus: isAdmin,

    // Admin
    canManageUsers:      isAdmin,
    canManageMarkets:    isAdmin,
    canReviewKYC:        isAdmin && FEATURES.KYC_MANAGEMENT,
    canViewAuditLogs:    isAdmin,
    canViewRiskDashboard: isAdmin && FEATURES.RISK_DASHBOARD,

    // Role flags
    isRetail:       role === 'retail',
    isProfessional: role === 'professional',
    isAdmin,
    role,
  }
}
