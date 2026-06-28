'use client'

import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/user'

interface RoleBadgeProps {
  role:       UserRole
  className?: string
}

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  retail: {
    label:     'RETAIL',
    className: 'badge-retail',
  },
  professional: {
    label:     'PRO',
    className: 'badge-pro',
  },
  admin: {
    label:     'ADMIN',
    className: 'badge-admin',
  },
}

/**
 * RoleBadge
 * ─────────
 * Displays the user's current role as a styled chip.
 * Used in the top navigation profile area and sidebar.
 */
export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role]

  return (
    <span
      className={cn(config.className, 'font-bold tracking-wider', className)}
      role="status"
      aria-label={`Account tier: ${config.label}`}
    >
      {config.label}
    </span>
  )
}
