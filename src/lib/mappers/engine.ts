// Maps engine health domain types → the admin SystemHealth view model.
// This is the canonical translation point: backend shape changes require
// only mapper updates, not component changes.
//
// ✅ COVERAGE: engineHealthToSystemHealth — /health endpoint is live.
//    throughput is always [] — no time-series endpoint exists.

import type { EngineHealth } from '@/types/engine'
import type { SystemHealth, ServiceStatus, SystemMetric } from '@/types/admin'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** snake_case → Title Case for display labels. */
function componentLabel(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatUptime(seconds: number): string {
  if (seconds >= 86_400) return `${(seconds / 86_400).toFixed(1)}d`
  if (seconds >= 3_600)  return `${(seconds / 3_600).toFixed(1)}h`
  return `${Math.floor(seconds / 60)}m`
}

// ─── EngineHealth → SystemHealth ─────────────────────────────────────────────

/**
 * Converts an EngineHealth payload to the SystemHealth view model consumed by
 * the admin SystemHealth panel (src/components/admin/SystemHealth.tsx).
 *
 * Mapping decisions:
 *  • healthy → 'operational', !healthy → 'degraded', overall status 'offline' → 'down'
 *  • per-component uptime is not in the backend payload; sentinel 0.9999 used
 *  • throughput chart stays empty — no request-rate time series available
 */
export function engineHealthToSystemHealth(health: EngineHealth): SystemHealth {
  const forceDown = health.status === 'offline'

  const services: ServiceStatus[] = health.components.map((c) => ({
    name:      componentLabel(c.name),
    state:     forceDown ? 'down' : c.healthy ? 'operational' : 'degraded',
    latencyMs: c.latencyMs ?? 0,
    uptime:    0.9999, // per-component uptime not provided by /health
  }))

  const metrics: SystemMetric[] = [
    { label: 'Uptime',        value: formatUptime(health.uptimeSeconds),          delta: 0 },
    { label: 'Health Checks', value: health.stats.healthChecks.toLocaleString(),  delta: 0 },
    { label: 'Warnings',      value: String(health.stats.warnings),               delta: health.stats.warnings },
    { label: 'Check Time',    value: `${health.checkDurationMs.toFixed(1)}ms`,    delta: 0 },
  ]

  return {
    services,
    metrics,
    throughput: [], // no time-series endpoint exists
  }
}
