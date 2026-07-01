// Components and hooks import `services` and never touch mock data or fetch()
// directly. Flipping NEXT_PUBLIC_API_MODE=live (config/env.ts) is the only
// change required once live services are implemented behind these interfaces.
//
//   components / hooks → services.<domain>.<method>() → mock | live impl
//
// Hybrid registry (live mode): engine is live; all other domains stay on mock
// until their backend endpoints are confirmed and their item schemas are known.

import { env } from '@/config/env'
import { mockServices } from './mock'
import { LiveEngineService } from './live'
import type { ServiceRegistry } from './interfaces'
import { diagnostics } from '@/lib/diagnostics'

// Record mode and base URL as early as possible so the dev indicator can
// display accurate state even before the first request leaves the browser.
diagnostics.init(env.API_MODE, env.API_BASE_URL)

function resolveServices(): ServiceRegistry {
  if (env.API_MODE === 'live') {
    diagnostics.setRegistry('LiveEngineService')
    if (process.env.NODE_ENV === 'development') {
      console.info('[LIVE] ServiceRegistry: LiveEngineService instantiated')
    }
    return {
      ...mockServices,
      engine: new LiveEngineService(),
    }
  }
  diagnostics.setRegistry('MockEngineService')
  if (process.env.NODE_ENV === 'development') {
    console.info('[MOCK] ServiceRegistry: MockEngineService active')
  }
  return mockServices
}

export const services: ServiceRegistry = resolveServices()

export * from './response'
export * from './interfaces'
