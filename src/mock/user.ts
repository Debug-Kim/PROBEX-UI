// Demo user profiles for UI development.
// replaced by real auth service.

import type { UserProfile } from '@/types/user'
import { asUserId }         from '@/types/branded'

export const MOCK_USERS: Record<string, UserProfile> = {
  retail: {
    id:               asUserId('usr_retail_demo'),
    email:            'retail@probex.io',
    displayName:      'Jordan Smith',
    avatarUrl:        null,
    role:             'retail',
    kycStatus:        'approved',
    isEmailVerified:  true,
    connectedWallets: [],
    createdAt:        '2026-01-20T00:00:00Z',
    lastActiveAt:     new Date().toISOString(),
    country:          'US',
    preferences: {
      defaultView:           'markets',
      notificationsEnabled:  true,
      priceAlerts:           true,
      consensusAlerts:       false,
      emailDigest:           'weekly',
    },
  },

  professional: {
    id:               asUserId('usr_pro_demo'),
    email:            'alex@probex.io',
    displayName:      'Alex Reeves',
    avatarUrl:        null,
    role:             'professional',
    kycStatus:        'approved',
    isEmailVerified:  true,
    connectedWallets: [],
    createdAt:        '2025-11-01T00:00:00Z',
    lastActiveAt:     new Date().toISOString(),
    country:          'GB',
    preferences: {
      defaultView:           'dashboard',
      notificationsEnabled:  true,
      priceAlerts:           true,
      consensusAlerts:       true,
      emailDigest:           'daily',
    },
  },

  admin: {
    id:               asUserId('usr_admin_demo'),
    email:            'admin@probex.io',
    displayName:      'System Admin',
    avatarUrl:        null,
    role:             'admin',
    kycStatus:        'approved',
    isEmailVerified:  true,
    connectedWallets: [],
    createdAt:        '2025-06-01T00:00:00Z',
    lastActiveAt:     new Date().toISOString(),
    country:          'US',
    preferences: {
      defaultView:           'dashboard',
      notificationsEnabled:  true,
      priceAlerts:           false,
      consensusAlerts:       true,
      emailDigest:           'never',
    },
  },
}

export const MOCK_DEFAULT_USER = MOCK_USERS['professional'] as UserProfile
