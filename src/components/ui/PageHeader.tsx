import type { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Page title (h1) */
  title:      string
  /** Optional subtitle line */
  subtitle?:  string
  /** Optional badge/chip next to title (e.g. role badge, live indicator) */
  badge?:     ReactNode
  /** Right-side actions slot (buttons, filters) */
  actions?:   ReactNode
  /** Whether to show the bottom divider */
  divider?:   boolean
}

/**
 * PageHeader
 * ──────────
 * Consistent header for all dashboard pages.
 *
 * Usage:
 *   <PageHeader
 *     title="Markets"
 *     subtitle="840 active Bitcoin prediction markets"
 *     actions={<Button>Create Alert</Button>}
 *   />
 */
export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  divider = false,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 mb-5',
        divider && 'pb-4 border-b border-border-subtle',
        className,
      )}
      {...props}
    >
      {/* Left: title block */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--probex-text-primary)' }}>
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm" style={{ color: 'var(--probex-text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: actions */}
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
