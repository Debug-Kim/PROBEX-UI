'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTheme, useSetTheme } from '@/store/themeStore'
import { THEME_META, THEME_NAMES, type ThemeName } from '@/types/theme'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'

/**
 * ThemeSwitcher
 * ─────────────
 * Dropdown that lets users switch between all 5 Probex themes.
 * Triggers via a palette icon button in the top navigation.
 *
 * Accessibility: fully keyboard navigable, closes on Escape.
 */
export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const currentTheme = useTheme()
  const setTheme     = useSetTheme()
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useKeyboardShortcut('Escape', () => setIsOpen(false), { enabled: isOpen })

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const handleSelect = (theme: ThemeName) => {
    setTheme(theme)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Switch theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-md',
          'transition-colors duration-150 cursor-pointer',
        )}
        style={{
          background:   isOpen ? 'var(--probex-primary-dim)' : 'var(--probex-surface-2)',
          border:       `1px solid ${isOpen ? 'var(--probex-border-active)' : 'var(--probex-border-default)'}`,
          color:        isOpen ? 'var(--probex-primary)' : 'var(--probex-text-secondary)',
        }}
      >
        {/* Palette icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-[calc(100%+6px)] z-50',
            'rounded-lg overflow-hidden w-[220px]',
            'shadow-surface-lg',
            'animate-fade-in-up',
          )}
          style={{
            background: 'var(--probex-surface-2)',
            border:     '1px solid var(--probex-border-default)',
          }}
          role="listbox"
          aria-label="Select theme"
        >
          <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--probex-border)' }}>
            <p className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>
              Theme
            </p>
          </div>

          <div className="py-1">
            {THEME_NAMES.map((themeName) => {
              const meta      = THEME_META[themeName]
              const isActive  = currentTheme === themeName

              return (
                <button
                  key={themeName}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(themeName)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5',
                    'transition-colors duration-100 cursor-pointer text-left',
                    'hover:bg-[var(--probex-border)]',
                  )}
                  style={isActive ? { background: 'var(--probex-primary-dim)' } : undefined}
                >
                  {/* Color swatch */}
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 ring-1 ring-inset"
                    style={{
                      background:  `linear-gradient(135deg, ${meta.primaryColor}, ${meta.secondaryColor})`,
                    }}
                    aria-hidden="true"
                  />

                  {/* Label + description */}
                  <div className="flex flex-col gap-0">
                    <span
                      className="text-xs font-medium leading-none"
                      style={{ color: isActive ? 'var(--probex-primary)' : 'var(--probex-text-primary)' }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <svg
                      className="ml-auto flex-shrink-0"
                      width="12" height="12" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ color: 'var(--probex-primary)' }}
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
