'use client'

import { cn }          from '@/lib/utils'
import { useUIStore }  from '@/store/uiStore'

interface SearchBarProps {
  /** Compact mode: caps width slightly for tighter layouts */
  compact?:   boolean
  className?: string
}

/**
 * SearchBar
 * ─────────
 * The navbar's visual anchor. A prominent trigger that opens the global
 * CommandPalette (markets, pages, actions) — the palette owns the actual search
 * UI, so search is not duplicated. ⌘K is registered by the palette.
 */
export function SearchBar({ compact = false, className }: SearchBarProps) {
  const openCommand = useUIStore((s) => s.openCommand)

  return (
    <button
      onClick={openCommand}
      aria-label="Search markets and commands (Control or Command + K)"
      aria-keyshortcuts="Meta+K Control+K"
      className={cn(
        'focus-ring group flex items-center gap-2.5 rounded-lg px-3.5 py-2 w-full transition-all duration-200',
        compact ? 'max-w-[440px]' : 'max-w-[560px]',
        className,
      )}
      style={{
        background: 'var(--probex-surface-2)',
        border:     '1px solid var(--probex-border-default)',
        cursor:     'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--probex-border-active)'; e.currentTarget.style.background = 'var(--probex-surface-3)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--probex-border-default)'; e.currentTarget.style.background = 'var(--probex-surface-2)' }}
    >
      <svg
        width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"
        className="flex-shrink-0 transition-colors duration-200"
        style={{ color: 'var(--probex-text-muted)' }}
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
      <span className="text-sm truncate" style={{ color: 'var(--probex-text-muted)' }}>
        <span className="hidden md:inline">Search markets, pages &amp; actions…</span>
        <span className="md:hidden">Search…</span>
      </span>
      <kbd
        className="ml-auto hidden sm:flex items-center gap-0.5 text-2xs rounded-md px-1.5 py-0.5 font-mono flex-shrink-0 tracking-wide"
        style={{ background: 'var(--probex-surface)', color: 'var(--probex-text-disabled)', border: '1px solid var(--probex-border)' }}
      >
        ⌘K
      </kbd>
    </button>
  )
}
