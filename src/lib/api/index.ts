/**
 * API Service Layer
 * ──────────────────
 * All external data access goes through typed service interfaces.
 * Components never call fetch() directly.
 *
 * Current state:
 *   - Service interfaces defined
 *   - No implementations yet
 *
 * Mock implementations injected
 * Live implementations injected
 *
 * Injection pattern:
 *   The active service is determined by NEXT_PUBLIC_API_MODE env var.
 *   Each service file exports a `createXxxService()` factory that
 *   returns the appropriate implementation.
 */

export type { IMarketService }   from './marketService'
