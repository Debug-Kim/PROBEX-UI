// Developer diagnostics — module-level singleton, dev-only.
//
// Populated by:
//   • src/lib/services/index.ts  — registers which registry impl was instantiated
//   • src/lib/api/client.ts      — records every outgoing Axios request/response
//
// Consumed by:
//   • src/components/dev/DevModeIndicator.tsx — polls snapshot() once per second
//
// No-op in production: NODE_ENV checks at the call sites mean nothing is ever
// written to this singleton in a production build. The singleton itself is tiny
// (< 1 KB) and harmless even if included.

export interface RequestRecord {
  method:     string
  endpoint:   string
  status:     number | null
  durationMs: number | null
  startedAt:  number  // epoch ms
}

export interface DiagnosticsSnapshot {
  apiMode:                'mock' | 'live'
  apiBaseUrl:             string
  registryImpl:           'MockEngineService' | 'LiveEngineService'
  liveEngineInstantiated: boolean
  requestCount:           number
  lastRequest:            RequestRecord | null
}

const _blank: DiagnosticsSnapshot = {
  apiMode:                'mock',
  apiBaseUrl:             '',
  registryImpl:           'MockEngineService',
  liveEngineInstantiated: false,
  requestCount:           0,
  lastRequest:            null,
}

let _snap: DiagnosticsSnapshot = { ..._blank }

export const diagnostics = {
  /** Called by services/index.ts at module init. */
  init(mode: 'mock' | 'live', baseUrl: string): void {
    _snap = { ..._snap, apiMode: mode, apiBaseUrl: baseUrl }
  },

  /** Called by services/index.ts after resolveServices() picks an impl. */
  setRegistry(impl: 'MockEngineService' | 'LiveEngineService'): void {
    _snap = {
      ..._snap,
      registryImpl:           impl,
      liveEngineInstantiated: impl === 'LiveEngineService',
    }
  },

  /** Called by Axios request interceptor when a request leaves the client. */
  recordRequest(method: string, endpoint: string): void {
    _snap = {
      ..._snap,
      requestCount: _snap.requestCount + 1,
      lastRequest:  { method, endpoint, status: null, durationMs: null, startedAt: Date.now() },
    }
  },

  /** Called by Axios response interceptor (success and error paths). */
  recordResponse(status: number, durationMs: number): void {
    if (!_snap.lastRequest) return
    _snap = {
      ..._snap,
      lastRequest: { ..._snap.lastRequest, status, durationMs },
    }
  },

  /** Returns a shallow copy of the current state. Safe to call from anywhere. */
  snapshot(): DiagnosticsSnapshot {
    return { ..._snap }
  },
}
