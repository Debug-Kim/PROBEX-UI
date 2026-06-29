'use client'

// Single source of account-derivation logic shared by the navbar profile menu
// and the sidebar user card. Always returns a renderable shape — including a
// graceful Guest state when signed out — so no account surface ever collapses.

import { useCurrentUser, useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/user'

export interface AccountInfo {
  isGuest:     boolean
  displayName: string
  email:       string | null
  role:        UserRole | null
  initials:    string
  logout:      () => Promise<void>
}

export function useAccount(): AccountInfo {
  const user   = useCurrentUser()
  const logout = useAuthStore((s) => s.logout)

  if (!user) {
    return { isGuest: true, displayName: 'Guest', email: null, role: null, initials: 'G', logout }
  }

  const initials =
    user.displayName.split(' ').slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase() || 'U'

  return {
    isGuest:     false,
    displayName: user.displayName,
    email:       user.email,
    role:        user.role,
    initials,
    logout,
  }
}
