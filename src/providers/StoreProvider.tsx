'use client'

import { useEffect, useState, type ReactNode } from 'react'

interface StoreProviderProps {
  children: ReactNode
}

// Zustand SSR hydration guard: persisted stores hydrate from localStorage after
// the server HTML is sent, which would cause a hydration mismatch. So we hold
// children until the first client mount (one render cycle). Wraps the dashboard
// shell; pages without persisted state can skip it.
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
