// Components and hooks import `services` and never touch mock data or fetch()
// directly. Flipping NEXT_PUBLIC_API_MODE=live (config/env.ts) is the only
// change required once live services are implemented behind these interfaces.
//
//   components / hooks → services.<domain>.<method>() → mock | live impl

import { env } from '@/config/env'
import { mockServices } from './mock'
import type { ServiceRegistry } from './interfaces'

function resolveServices(): ServiceRegistry {
  if (env.API_MODE === 'live') {
    // Live services follow the same interfaces (see live.template.ts and
    // docs/backend-integration.md). Until they are implemented, fall back to
    // mock so the UI keeps working.
    if (typeof console !== 'undefined') {
      console.warn('[services] NEXT_PUBLIC_API_MODE=live but live services are not yet implemented — using mock.')
    }
    return mockServices
  }
  return mockServices
}

export const services: ServiceRegistry = resolveServices()

export * from './response'
export * from './interfaces'
