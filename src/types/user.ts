import type { UserId, WalletAddress } from './branded'

// ─── Role system ──────────────────────────────────────────────────────────

export const USER_ROLES = ['retail', 'professional', 'admin'] as const
export type UserRole = (typeof USER_ROLES)[number]

/**
 * Numeric hierarchy — higher number = more access.
 * admin (3) > professional (2) > retail (1)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  retail:       1,
  professional: 2,
  admin:        3,
} as const

/**
 * Returns true if userRole meets or exceeds requiredRole.
 */
export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

// ─── KYC ─────────────────────────────────────────────────────────────────

export type KYCStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'requires_review'

// ─── User profile ─────────────────────────────────────────────────────────

export interface UserProfile {
  readonly id:          UserId
  readonly email:       string
  displayName:          string
  avatarUrl:            string | null
  role:                 UserRole
  kycStatus:            KYCStatus
  isEmailVerified:      boolean
  connectedWallets:     WalletAddress[]
  createdAt:            string // ISO 8601
  lastActiveAt:         string
  country:              string | null  // ISO 3166-1 alpha-2
  preferences:          UserPreferences
}

export interface UserPreferences {
  defaultView:        'dashboard' | 'markets' | 'portfolio'
  notificationsEnabled: boolean
  priceAlerts:        boolean
  consensusAlerts:    boolean
  emailDigest:        'daily' | 'weekly' | 'never'
}

// ─── Auth state ───────────────────────────────────────────────────────────

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  status:    AuthStatus
  user:      UserProfile | null
  sessionId: string | null
}

export interface AuthActions {
  login:          (credentials: LoginCredentials) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout:         () => Promise<void>
  refreshSession: () => Promise<void>
}

export type AuthStore = AuthState & AuthActions

// ─── Credentials ──────────────────────────────────────────────────────────

export interface LoginCredentials {
  email:    string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  displayName: string
  role:        Extract<UserRole, 'retail' | 'professional'>
}
