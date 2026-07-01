'use client'

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE CHAIN PROBE — developer verification only.
//
// Purpose: prove the complete chain is wired correctly:
//   Backend → Axios → DTO adapter → LiveEngineService → React hook → component
//
// Guards:
//   • process.env.NODE_ENV check → dead-code eliminated by webpack in production
//   • Component returns null immediately at runtime when not in dev mode
//
// Usage: rendered at the bottom of AdminConsole only in development mode.
// NEVER import this file from production code paths.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import type { ServiceState, ServiceError } from '@/lib/services/response'
import {
  useEngineHealth,
  useEngineStats,
  useEngineRuntime,
  useEngineMarkets,
} from '@/hooks/useServices'

const IS_DEV = process.env.NODE_ENV === 'development'

// ─── HTTP status inference ────────────────────────────────────────────────────
// Axios resolves only on 2xx, so success always means 200. On error the
// ServiceException code lets us recover the approximate HTTP status.

const CODE_TO_HTTP: Record<string, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN:    403,
  NOT_FOUND:    404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
}

function inferHttpStatus(err: ServiceError): string {
  const n = CODE_TO_HTTP[err.code]
  return n ? `${n}` : err.code   // e.g. "404" or "NETWORK"
}

// ─── Timing hook ─────────────────────────────────────────────────────────────
// Records wall-clock ms from the moment the hook is first evaluated until
// status leaves 'loading'. Only captures once per mount.

function useElapsed(status: string): number | null {
  const startRef    = useRef(Date.now())
  const [ms, setMs] = useState<number | null>(null)
  useEffect(() => {
    if (status !== 'loading') {
      setMs((prev) => prev ?? Date.now() - startRef.current)
    }
  }, [status])
  return ms
}

// ─── Single probe card ────────────────────────────────────────────────────────

interface ProbeCardProps<T> {
  label:    string
  path:     string
  state:    ServiceState<T>
}

function ProbeCard<T>({ label, path, state }: ProbeCardProps<T>) {
  const elapsed = useElapsed(state.status)

  const isLoading = state.status === 'loading'
  const isOk      = state.status === 'success' || state.status === 'empty'
  const isError   = state.status === 'error'

  const headerBg = isLoading ? 'rgba(99,102,241,0.08)'
                 : isOk      ? 'rgba(34,197,94,0.07)'
                              : 'rgba(239,68,68,0.07)'

  const accentColor = isLoading ? '#818cf8'
                    : isOk      ? '#22c55e'
                                : '#ef4444'

  const statusText = isLoading ? 'LOADING…'
                   : isOk      ? '200 OK'
                   : `${inferHttpStatus(state.error!)} ${state.error!.code}`

  return (
    <div
      style={{
        background:   'rgba(10,10,14,0.7)',
        border:       `1px solid ${accentColor}33`,
        borderRadius:  8,
        overflow:     'hidden',
        fontFamily:   'ui-monospace,"Cascadia Code",Menlo,monospace',
        fontSize:     11,
      }}
    >
      {/* Card header */}
      <div
        style={{
          background:   headerBg,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding:      '7px 10px',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
          gap:          8,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.04em' }}>
            {label}
          </span>
          <span style={{ color: '#64748b', fontSize: 9 }}>
            {path}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {elapsed !== null && (
            <span style={{ color: '#64748b', fontSize: 9 }}>{elapsed}ms</span>
          )}
          <StatusChip text={statusText} color={accentColor} />
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '8px 10px' }}>
        {isLoading && (
          <span style={{ color: '#64748b' }}>Waiting for response…</span>
        )}

        {isError && state.error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Row label="CODE"     value={state.error.code}    color="#ef4444" />
            <Row label="MESSAGE"  value={state.error.message} color="#fca5a5" />
            <Row label="RETRYABLE" value={String(state.error.retryable)} color="#64748b" />
          </div>
        )}

        {isOk && state.data !== null && (
          <pre
            style={{
              margin:      0,
              color:       '#94a3b8',
              fontSize:    10,
              lineHeight:  1.55,
              maxHeight:   180,
              overflowY:   'auto',
              overflowX:   'hidden',
              whiteSpace:  'pre-wrap',
              wordBreak:   'break-all',
            }}
          >
            {JSON.stringify(state.data, null, 2)}
          </pre>
        )}

        {isOk && state.data === null && (
          <span style={{ color: '#64748b' }}>Response: null / empty</span>
        )}
      </div>
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function StatusChip({ text, color }: { text: string; color: string }) {
  return (
    <span
      style={{
        padding:      '2px 7px',
        borderRadius:  4,
        background:   `${color}18`,
        border:       `1px solid ${color}44`,
        color,
        fontWeight:   700,
        fontSize:     9,
        letterSpacing: '0.06em',
      }}
    >
      {text}
    </span>
  )
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, letterSpacing: '0.06em', flexShrink: 0, width: 60 }}>
        {label}
      </span>
      <span style={{ color, wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function EngineChainProbe() {
  const health  = useEngineHealth()
  const stats   = useEngineStats()
  const runtime = useEngineRuntime()
  const markets = useEngineMarkets()

  if (!IS_DEV) return null

  return (
    <section
      aria-label="Engine chain probe (dev only)"
      style={{
        marginTop:    32,
        padding:      '16px 18px',
        background:   'rgba(99,102,241,0.04)',
        border:       '1px dashed rgba(99,102,241,0.25)',
        borderRadius:  10,
      }}
    >
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span
          style={{
            fontFamily:   'ui-monospace,"Cascadia Code",Menlo,monospace',
            fontSize:     9,
            fontWeight:   700,
            letterSpacing: '0.12em',
            color:        '#818cf8',
            padding:      '2px 7px',
            background:   'rgba(99,102,241,0.12)',
            border:       '1px solid rgba(99,102,241,0.28)',
            borderRadius:  4,
          }}
        >
          DEV ONLY
        </span>
        <span
          style={{
            fontFamily: 'ui-monospace,"Cascadia Code",Menlo,monospace',
            fontSize:   12,
            fontWeight: 700,
            color:      '#c7d2fe',
          }}
        >
          Engine Chain Probe
        </span>
        <span style={{ fontFamily: 'ui-monospace,"Cascadia Code",Menlo,monospace', fontSize: 10, color: '#475569' }}>
          Backend → Axios → DTO → LiveEngineService → Hook → Component
        </span>
      </div>

      {/* 2×2 card grid */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap:                  12,
        }}
      >
        <ProbeCard label="Health"    path="GET /health"        state={health} />
        <ProbeCard label="Stats"     path="GET /api/stats"     state={stats} />
        <ProbeCard label="Runtime"   path="GET /api/runtime"   state={runtime} />
        <ProbeCard label="Markets"   path="GET /api/markets"   state={markets} />
      </div>
    </section>
  )
}
