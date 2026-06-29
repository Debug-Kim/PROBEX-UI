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
      staleTime: 30_000,
      // Retry + focus/reconnect refetch only in production (less dev noise).
      retry: env.NODE_ENV === 'production' ? 2 : 0,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      refetchOnWindowFocus: env.NODE_ENV === 'production',
      refetchOnReconnect: env.NODE_ENV === 'production',
      networkMode: 'online',
    },
    mutations: {
      retry: 0,
      networkMode: 'always', // allow offline mutations for optimistic UI
    },
  },
}

interface QueryProviderProps {
  children: ReactNode
}

// QueryClient is created via useState (not module-level) so each server render /
// test gets a fresh, stable instance. Devtools load in development only.
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

/** Dev-only devtools mount (stubbed). */
function DevTools() {
  if (env.NODE_ENV !== 'development') return null
  // TODO: dynamically import @tanstack/react-query-devtools (ssr: false) once added.
  return null
}
