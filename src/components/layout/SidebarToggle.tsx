'use client'

import { cn } from '@/lib/utils'
import { useSidebarStore, useSidebarCollapsed } from '@/store/sidebarStore'

/**
 * SidebarToggle
 * ─────────────
 * The collapse/expand button at the bottom of the sidebar.
 * Uses an animated chevron icon that rotates 180° when collapsed.
 */
export function SidebarToggle() {
  const toggle      = useSidebarStore((s) => s.toggle)
  const isCollapsed = useSidebarCollapsed()

  return (
    <button
      onClick={toggle}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-expanded={!isCollapsed}
      className={cn(
        'focus-ring flex items-center gap-2 w-full py-3',
        'text-xs font-medium transition-colors duration-200 cursor-pointer',
        'border-t hover:opacity-80',
        isCollapsed ? 'justify-center px-0' : 'px-4',
      )}
      style={{
        borderTopColor: 'var(--probex-border)',
        color:          'var(--probex-text-muted)',
      }}
    >
      {/* Chevron SVG — rotates when collapsed */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'flex-shrink-0 transition-transform duration-200',
          isCollapsed ? 'rotate-180' : 'rotate-0',
        )}
        aria-hidden="true"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>

      {/* Label — hidden when collapsed */}
      {!isCollapsed && (
        <span className="whitespace-nowrap">Collapse</span>
      )}
    </button>
  )
}
