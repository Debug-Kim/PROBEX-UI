'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcutOptions {
  /** Whether the shortcut requires the Meta (⌘) or Ctrl key */
  meta?:    boolean
  /** Whether the shortcut requires the Shift key */
  shift?:   boolean
  /** Whether the shortcut requires the Alt key */
  alt?:     boolean
  /** Whether to prevent the default browser action */
  preventDefault?: boolean
  /** Whether the shortcut is currently active */
  enabled?: boolean
}

/**
 * useKeyboardShortcut
 * ───────────────────
 * Registers a global keyboard shortcut that fires a callback.
 *
 * Usage:
 *   useKeyboardShortcut('k', openSearch, { meta: true })
 *   // Fires on ⌘K (Mac) or Ctrl+K (Windows/Linux)
 */
export function useKeyboardShortcut(
  key:      string,
  callback: (event: KeyboardEvent) => void,
  options:  KeyboardShortcutOptions = {},
): void {
  const {
    meta            = false,
    shift           = false,
    alt             = false,
    preventDefault  = true,
    enabled         = true,
  } = options

  const stableCallback = useCallback(callback, [callback])

  useEffect(() => {
    if (!enabled) return

    const handler = (event: KeyboardEvent) => {
      const metaMatch  = meta  ? (event.metaKey || event.ctrlKey) : true
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey || !shift
      const altMatch   = alt   ? event.altKey   : !event.altKey || !alt
      const keyMatch   = event.key.toLowerCase() === key.toLowerCase()

      if (keyMatch && metaMatch && shiftMatch && altMatch) {
        // Don't fire shortcuts when typing in inputs
        const target = event.target as HTMLElement
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.contentEditable === 'true'

        if (isInput && !meta) return

        if (preventDefault) event.preventDefault()
        stableCallback(event)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, meta, shift, alt, preventDefault, enabled, stableCallback])
}
