'use client'

import { create } from 'zustand'
import type { AuthStore, AuthStatus, UserProfile } from '@/types/user'

// ─── Mock default user ( only — replaced auth wiring) ────
// NOTE: role is 'admin' during so every screen — including the Admin
// Console — is reachable from the nav for UI review. (auth wiring)
// restores real per-user roles from the session.

const MOCK_USER: UserProfile = {
  id:               'usr_demo_01' as import('@/types/branded').UserId,
  email:            'alex@probex.io',
  displayName:      'Alex Reeves',
  avatarUrl:        null,
  role:             'admin',
  kycStatus:        'approved',
  isEmailVerified:  true,
  connectedWallets: [],
  createdAt:        '2025-01-15T00:00:00Z',
  lastActiveAt:     new Date().toISOString(),
  country:          'US',
  preferences: {
    defaultView:          'dashboard',
    notificationsEnabled: true,
    priceAlerts:          true,
    consensusAlerts:      false,
    emailDigest:          'weekly',
  },
}

// ─── Store ────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()((set) => ({
  // ── State ────────────────────────────────────────────────────────────────
 status: 'authenticated' as AuthStatus, // always authenticated
  user:      MOCK_USER,
  sessionId: 'sess_mock_phase1',

 // ── Actions (stubs — replaced ) ────────────────────────────────
  login: async (_credentials) => {
 // connect to authService
    set({ status: 'authenticated', user: MOCK_USER })
  },

  loginWithGoogle: async () => {
 // connect to Google OAuth
    set({ status: 'authenticated', user: MOCK_USER })
  },

  logout: async () => {
    set({ status: 'unauthenticated', user: null, sessionId: null })
  },

  refreshSession: async () => {
 // refresh JWT
  },
}))

// ─── Selector hooks ────────────────────────────────────────────────────────

export const useCurrentUser = (): UserProfile | null =>
  useAuthStore((s) => s.user)

export const useAuthStatus = (): AuthStatus =>
  useAuthStore((s) => s.status)

export const useIsAuthenticated = (): boolean =>
  useAuthStore((s) => s.status === 'authenticated')

export const useUserRole = () =>
  useAuthStore((s) => s.user?.role ?? 'retail')
