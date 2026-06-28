'use client'

import { useState, type ReactNode } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query'
import { env } from '@/config/env'

// ─── QueryClient configuration ────────────────────────────────────────────

const QUERY_CLIENT_CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Data is considered fresh for 30s unless overridden per-query
      staleTime: 30_000,
      // Retry failed requests up to 2 times, with exponential backoff
      retry: env.NODE_ENV === 'production' ? 2 : 0,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      // Refetch on window focus in production
      refetchOnWindowFocus: env.NODE_ENV === 'production',
      // Do not refetch on reconnect during development (reduces noise)
      refetchOnReconnect: env.NODE_ENV === 'production',
      // Network mode: online = only fetch when network available
      networkMode: 'online',
    },
    mutations: {
      retry: 0,
      // Network mode: always = allow mutations even when offline (for optimistic UI)
      networkMode: 'always',
    },
  },
}

interface QueryProviderProps {
  children: ReactNode
}

/**
 * QueryProvider
 * ─────────────
 * Wraps the app with TanStack QueryClientProvider.
 *
 * The QueryClient is created inside the component (not at module level)
 * to ensure each test and server render gets a fresh instance.
 * `useState` with no setter ensures a stable instance across re-renders.
 *
 * ReactQueryDevtools are only loaded in development via dynamic import
 * to keep the production bundle clean.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient(QUERY_CLIENT_CONFIG))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {env.NODE_ENV === 'development' && <DevTools />}
    </QueryClientProvider>
  )
}

// ─── DevTools (dev only, code-split) ─────────────────────────────────────

/**
 * Lazy-loads ReactQueryDevtools only in development.
 * Excluded from production bundle entirely.
 */
function DevTools() {
  // Dynamic import in dev — not loaded in production
  if (env.NODE_ENV !== 'development') return null

  // In a real project: import dynamically with next/dynamic
  // import dynamic from 'next/dynamic'
  // const ReactQueryDevtools = dynamic(() =>
  //   import('@tanstack/react-query-devtools').then((d) => d.ReactQueryDevtools),
  //   { ssr: false }
  // )
 // For stub: return null (add after installing devtools package)
  return null
}
