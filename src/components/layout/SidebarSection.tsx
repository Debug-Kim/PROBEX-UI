'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useSidebarCollapsed } from '@/store/sidebarStore'

interface SidebarSectionProps {
  /** Section label (hidden when sidebar is collapsed) */
  label:     string
  /** Nav items in this section */
  children:  ReactNode
  className?: string
}

/**
 * SidebarSection
 * ──────────────
 * Groups related sidebar items under a labelled section.
 * The label is hidden when the sidebar is collapsed.
 *
 * Usage:
 *   <SidebarSection label="Professional">
 *     <SidebarItem href="/consensus" icon={<Brain />} label="Consensus Engine" />
 *     <SidebarItem href="/analytics" icon={<BarChart />} label="Analytics" />
 *   </SidebarSection>
 */
export function SidebarSection({ label, children, className }: SidebarSectionProps) {
  const isCollapsed = useSidebarCollapsed()

  return (
    <div className={cn('sidebar-section px-2 py-1', className)}>
      {/* Section label — hidden in collapsed mode. Empty-label groups (e.g. the
          unlabelled Settings group) keep an empty marker here; its padding is
          collapsed on constrained heights via the sidebar-section-label rules. */}
      {!isCollapsed && (
        <p
          className={cn(
            'sidebar-section-label px-2 pb-1 pt-2 text-2xs font-semibold uppercase tracking-wider select-none',
            !label && 'sidebar-section-label-empty',
          )}
          style={{ color: 'var(--probex-text-disabled)' }}
        >
          {label}
        </p>
      )}

      {/* Collapsed: a thin horizontal divider instead of label */}
      {isCollapsed && (
        <div
          className="mx-2 my-1.5"
          style={{
            height:     '1px',
            background: 'var(--probex-border)',
          }}
          role="separator"
          aria-hidden="true"
        />
      )}

      <nav role="group" aria-label={label}>
        {children}
      </nav>
    </div>
  )
}
