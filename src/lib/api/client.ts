// Shared Axios client for the Probex backend/engine. The base URL comes solely
// from NEXT_PUBLIC_API_BASE_URL (via config/env) — no hardcoded URLs. The base
// already includes the `/api` prefix, so endpoint paths (from the endpoint
// registry) are appended directly. Failures are normalized to the same
// ServiceException codes the service layer already uses, so live services and
// hooks get consistent error handling.
//
// Authentication is intentionally NOT wired here yet — the request interceptor is
// the single place to attach it once the backend auth contract is defined.

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/config/env'
import { ServiceException } from '@/lib/services/response'

const DEFAULT_TIMEOUT_MS = 15_000

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL, // '' until NEXT_PUBLIC_API_BASE_URL is provided
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
})

// ─── Request interceptor ────────────────────────────────────────────────────
// Single chokepoint for outgoing requests (debug logging now; auth header later).
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (env.DEBUG) {
      const method = (config.method ?? 'get').toUpperCase()
      console.debug(`[api] → ${method} ${config.baseURL ?? ''}${config.url ?? ''}`)
    }
    return config
  },
  (error: unknown) => Promise.reject(error),
)

// ─── Response interceptor ───────────────────────────────────────────────────
// Pass successes through untouched; normalize every failure into a typed
// ServiceException so callers never branch on raw Axios error shapes.
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(toServiceException(error)),
)

function toServiceException(error: AxiosError): ServiceException {
  // No HTTP response → network, timeout, DNS, or CORS failure.
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return new ServiceException('TIMEOUT', 'Request timed out', true)
    }
    return new ServiceException('NETWORK', error.message || 'Network error', true)
  }

  const status = error.response.status
  const code =
    status === 401 ? 'UNAUTHORIZED' :
    status === 403 ? 'FORBIDDEN' :
    status === 404 ? 'NOT_FOUND' :
    status === 429 ? 'RATE_LIMITED' :
    status >= 500  ? 'SERVER_ERROR' :
                     'HTTP_ERROR'
  const retryable = status >= 500 || status === 429
  return new ServiceException(code, `Request failed (${status})`, retryable)
}

// ─── Typed helpers ──────────────────────────────────────────────────────────
// Thin wrappers live services can use instead of touching Axios directly. They
// return the parsed JSON body; errors already arrive as ServiceException.

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const res = await apiClient.get<T>(path, params ? { params } : undefined)
  return res.data
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiClient.post<T>(path, body)
  return res.data
}
