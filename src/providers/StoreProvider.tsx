'use client'

import { useEffect, useState, type ReactNode } from 'react'

interface StoreProviderProps {
  children: ReactNode
}

/**
 * StoreProvider — Zustand SSR hydration guard
 * ────────────────────────────────────────────
 * Problem: Zustand stores with `persist` middleware hydrate from localStorage
 * after the server-rendered HTML has been sent. This causes a React hydration
 * mismatch because the server renders with default state while the client
 * immediately hydrates to the persisted state.
 *
 * Solution: Suppress rendering of children until after the first client-side
 * mount, at which point all stores are hydrated from localStorage.
 *
 * This component wraps the dashboard shell. Auth and marketing pages that
 * don't need persisted state can skip this wrapper.
 *
 * Performance note:
 *   The suppression only affects the first paint. Once `hasMounted` is true
 *   (after the first useEffect), React renders normally. The cost is one
 *   render cycle — negligible.
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    // Return a skeleton shell during SSR / pre-hydration.
    // This div preserves the document structure to prevent layout shift.
    return (
      <div
        aria-hidden="true"
        style={{ visibility: 'hidden', minHeight: '100vh' }}
      />
    )
  }

  return <>{children}</>
}
