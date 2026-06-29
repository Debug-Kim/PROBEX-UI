// Every Probex service speaks the same envelope, so swapping mock → live is
// mechanical. The four UI states (loading / success / empty / error) are
// expressed through ServiceState; the wire payload through ApiResult.
//
// Pagination reuses the existing PaginatedResponse<T> (types/market) — not
// redefined here.

import type { PaginatedResponse } from '@/types/market'

export type { PaginatedResponse }

// ─── Status ─────────────────────────────────────────────────────────────────

export type ServiceStatus = 'loading' | 'success' | 'empty' | 'error'

export interface ServiceError {
  /** Stable machine code, e.g. 'NOT_FOUND', 'NETWORK', 'UNAUTHORIZED' */
  code:      string
  message:   string
  retryable: boolean
}

// ─── Wire payload ─────────────────────────────────────────────────────────────

export interface ApiMeta {
  total?:   number
  cursor?:  string | null
  hasMore?: boolean
  /** ISO 8601 server snapshot time */
  asOf?:    string
}

/** Success envelope returned by every service method. */
export interface ApiResult<T> {
  data:  T
  meta?: ApiMeta
}

// ─── UI state (consumed by hooks) ──────────────────────────────────────────────

export interface ServiceState<T> {
  status: ServiceStatus
  data:   T | null
  error:  ServiceError | null
}

/** Streaming/subscription teardown — real-time itself lives in lib/realtime. */
export type Unsubscribe = () => void

// ─── Constructors / helpers ────────────────────────────────────────────────────

export function ok<T>(data: T, meta?: ApiMeta): ApiResult<T> {
  return meta === undefined ? { data } : { data, meta }
}

export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  return false
}

export function toServiceState<T>(result: ApiResult<T>): ServiceState<T> {
  return {
    status: isEmptyValue(result.data) ? 'empty' : 'success',
    data:   result.data,
    error:  null,
  }
}

export function loadingState<T>(): ServiceState<T> {
  return { status: 'loading', data: null, error: null }
}

export function errorState<T>(error: ServiceError): ServiceState<T> {
  return { status: 'error', data: null, error }
}

/** Typed error thrown by services; carried through to ServiceState.error. */
export class ServiceException extends Error {
  readonly code:      string
  readonly retryable: boolean
  constructor(code: string, message: string, retryable = false) {
    super(message)
    this.name      = 'ServiceException'
    this.code      = code
    this.retryable = retryable
  }
}

export function toServiceError(e: unknown): ServiceError {
  if (e instanceof ServiceException) {
    return { code: e.code, message: e.message, retryable: e.retryable }
  }
  return {
    code:      'SERVICE_ERROR',
    message:   e instanceof Error ? e.message : String(e),
    retryable: true,
  }
}
