'use client'

import { useEffect, type ReactNode } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { DEFAULT_THEME } from '@/types/theme'

interface ThemeProviderProps {
  children:     ReactNode
  /**
   * Initial theme resolved server-side from cookie.
   * Prevents flash of default theme on first paint.
   */
  initialTheme?: string | undefined
}

/**
 * ThemeProvider
 * ─────────────
 * Applies the active Probex theme as a `data-theme` attribute on `<html>`.
 * All CSS variable overrides in probex-tokens.css are scoped to this attribute.
 *
 * Hydration safety:
 *   The server renders with `initialTheme` (from cookie) set directly on <html>
 *   in the root layout. On mount, this provider syncs the persisted Zustand store
 *   value to the DOM — avoiding a flash of incorrect theme.
 *
 * Not using `next-themes` for Probex because:
 *   - Probex themes are not just dark/light: they are full token-set swaps.
 *   - We need direct control over which CSS variables are applied.
 *   - next-themes adds a `class` attribute; Probex uses `data-theme`.
 */
export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const { theme, setTheme } = useThemeStore()

  // On first mount: apply the persisted theme to DOM.
  // The store's onRehydrateStorage callback also does this, but this
  // useEffect ensures it fires even if rehydration was synchronous.
  useEffect(() => {
    const resolvedTheme = theme ?? initialTheme ?? DEFAULT_THEME
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [theme, initialTheme])

  // Detect system dark/light preference (informational only — does not override theme)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    useThemeStore.setState({ systemPrefersDark: mq.matches })

    const handler = (e: MediaQueryListEvent) => {
      useThemeStore.setState({ systemPrefersDark: e.matches })
    }

    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Sync theme on every change (belt-and-suspenders alongside store middleware)
  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  // If theme store hasn't hydrated yet, apply the initial theme from server
  useEffect(() => {
    if (!theme && initialTheme) {
      setTheme(initialTheme as Parameters<typeof setTheme>[0])
    }
  }, [theme, initialTheme, setTheme])

  return <>{children}</>
}
