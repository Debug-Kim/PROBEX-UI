'use client'

import { FEATURES, type FeatureKey } from '@/config/features'
import { useUserRole } from '@/store/authStore'
import { hasPermission } from '@/types/user'
import type { UserRole } from '@/types/user'

/**
 * useFeatureFlag
 * ──────────────
 * Single hook for all feature flag checks. Components never import FEATURES
 * directly — always go through this hook. This allows:
 *   - Server-side overrides (A/B testing)
 *   - Role-based flag overrides
 *   - Remote flag fetching in future (swap implementation, not callsites)
 *
 * Usage:
 *   const hasConsensus = useFeatureFlag('CONSENSUS_ENGINE')
 *   if (!hasConsensus) return null
 */
export function useFeatureFlag(flag: FeatureKey): boolean {
  return FEATURES[flag]
}

/**
 * usePermission
 * ─────────────
 * Checks whether the current user meets a minimum role requirement.
 *
 * Usage:
 *   const canViewAnalytics = usePermission('professional')
 */
export function usePermission(requiredRole: UserRole): boolean {
  const userRole = useUserRole()
  return hasPermission(userRole, requiredRole)
}

/**
 * useFeatureAccess
 * ────────────────
 * Combined flag + role check. Returns true only if:
 *   1. The feature flag is enabled, AND
 *   2. The user's role meets the minimum requirement.
 *
 * Usage:
 *   const canAccess = useFeatureAccess('ANALYTICS', 'professional')
 */
export function useFeatureAccess(
  flag:         FeatureKey,
  requiredRole: UserRole = 'retail',
): boolean {
  const flagEnabled = useFeatureFlag(flag)
  const hasRole     = usePermission(requiredRole)
  return flagEnabled && hasRole
}

/**
 * useDerivedPermissions
 * ─────────────────────
 * Returns a stable object of all derived permissions for the current user.
 * Prefer this over multiple individual calls in the same component.
 */
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
