'use client'

/**
 * AppProviders
 *
 * Provider composition root. Updated to include RealtimeProvider.
 * Order matters: StoreProvider must come before RealtimeProvider so liveStore
 * is available when the stream client boots.
 */

import type { ReactNode } from 'react'
import { ThemeProvider } from './ThemeProvider'
import { QueryProvider } from './QueryProvider'
import { StoreProvider } from './StoreProvider'
import { RealtimeProvider } from './RealtimeProvider'
import { TooltipProvider } from '@/components/ui/Tooltip'

interface AppProvidersProps {
  children:      ReactNode
  initialTheme?: string
}

export function AppProviders({ children, initialTheme }: AppProvidersProps) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <QueryProvider>
        <StoreProvider>
          <RealtimeProvider>
            <TooltipProvider delayDuration={250} skipDelayDuration={300}>
              {children}
            </TooltipProvider>
          </RealtimeProvider>
        </StoreProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}

// Named exports
export { QueryProvider }   from './QueryProvider'
export { ThemeProvider }   from './ThemeProvider'
export { StoreProvider }   from './StoreProvider'
export { RealtimeProvider } from './RealtimeProvider'
