'use client'

// Developer diagnostics overlay — only renders when NODE_ENV=development.
// Shows current API mode, backend URL, registry implementation, and the most
// recent live request. Collapses to a single badge on click to stay out of the
// way during normal dev work.
//
// This component is intentionally not unit-tested and not exported from the
// component index — it is exclusively a developer aid.

import { useState, useEffect } from 'react'
import { diagnostics, type DiagnosticsSnapshot } from '@/lib/diagnostics'

const IS_DEV = process.env.NODE_ENV === 'development'

function formatDuration(ms: number | null): string {
  if (ms === null) return '…'
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function formatTimestamp(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function statusColor(status: number | null): string {
  if (status === null) return 'var(--probex-text-muted)'
  if (status >= 200 && status < 300) return '#22c55e'
  if (status >= 400 && status < 500) return '#f59e0b'
  return '#ef4444'
}

// ─── Expanded panel ────────────────────────────────────────────────────────

function Panel({ snap, onCollapse }: { snap: DiagnosticsSnapshot; onCollapse: () => void }) {
  const isLive       = snap.apiMode === 'live'
  const noConsumers  = isLive && snap.requestCount === 0
  const lastReq      = snap.lastRequest

  return (
    <div
      role="status"
      aria-label="Developer diagnostics panel"
      style={{
        position:        'fixed',
        bottom:          12,
        right:           12,
        zIndex:          9999,
        width:           260,
        background:      'rgba(10,10,14,0.96)',
        border:          `1px solid ${isLive ? '#22c55e44' : '#6366f144'}`,
        borderRadius:    8,
        fontFamily:      'ui-monospace, "Cascadia Code", Menlo, monospace',
        fontSize:        11,
        color:           '#e2e8f0',
        boxShadow:       '0 4px 24px rgba(0,0,0,0.5)',
        userSelect:      'none',
        overflow:        'hidden',
      }}
    >
      {/* Header bar */}
      <div
        onClick={onCollapse}
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '7px 10px',
          background:     isLive ? 'rgba(34,197,94,0.08)' : 'rgba(99,102,241,0.08)',
          borderBottom:   '1px solid rgba(255,255,255,0.07)',
          cursor:         'pointer',
        }}
      >
        <span style={{ fontWeight: 700, letterSpacing: '0.08em', color: isLive ? '#22c55e' : '#818cf8' }}>
          API MODE: {snap.apiMode.toUpperCase()}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>click to collapse</span>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>

        {/* Backend URL */}
        {isLive && snap.apiBaseUrl ? (
          <Row label="Backend" value={snap.apiBaseUrl} valueColor="#94a3b8" truncate />
        ) : (
          <Row label="Registry" value={snap.registryImpl} valueColor="#818cf8" />
        )}

        {/* No consumers banner */}
        {noConsumers ? (
          <div
            style={{
              marginTop:   4,
              padding:     '6px 8px',
              background:  'rgba(245,158,11,0.10)',
              border:      '1px solid rgba(245,158,11,0.25)',
              borderRadius: 5,
              color:       '#fbbf24',
              lineHeight:  1.5,
            }}
          >
            <div style={{ fontWeight: 700 }}>Live mode enabled</div>
            <div style={{ opacity: 0.8 }}>No active consumers</div>
            <div style={{ opacity: 0.8 }}>No backend requests made</div>
          </div>
        ) : (
          <>
            {/* Request counter */}
            <Row
              label="Requests"
              value={String(snap.requestCount)}
              valueColor="#e2e8f0"
            />

            {/* Last request */}
            {lastReq && (
              <div
                style={{
                  marginTop:    2,
                  padding:      '5px 7px',
                  background:   'rgba(255,255,255,0.04)',
                  borderRadius:  5,
                  display:      'flex',
                  flexDirection: 'column',
                  gap:           3,
                }}
              >
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: '0.06em' }}>
                  LAST REQUEST · {formatTimestamp(lastReq.startedAt)}
                </div>
                <div style={{ fontWeight: 600, color: '#e2e8f0' }}>
                  {lastReq.method} {lastReq.endpoint}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 1 }}>
                  <span style={{ color: statusColor(lastReq.status) }}>
                    {lastReq.status !== null
                      ? `${lastReq.status} ${lastReq.status >= 200 && lastReq.status < 300 ? 'OK' : 'ERR'}`
                      : 'pending…'}
                  </span>
                  <span style={{ color: '#64748b' }}>
                    {formatDuration(lastReq.durationMs)}
                  </span>
                </div>
              </div>
            )}

            {/* Mock note when relevant */}
            {!isLive && snap.requestCount === 0 && (
              <div style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>
                Mock data · no HTTP requests
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Collapsed badge ───────────────────────────────────────────────────────

function Badge({ snap, onExpand }: { snap: DiagnosticsSnapshot; onExpand: () => void }) {
  const isLive = snap.apiMode === 'live'
  const color  = isLive ? '#22c55e' : '#818cf8'
  return (
    <button
      onClick={onExpand}
      aria-label="Open developer diagnostics"
      title={`API: ${snap.apiMode.toUpperCase()} · ${snap.requestCount} requests`}
      style={{
        position:     'fixed',
        bottom:       12,
        right:        12,
        zIndex:       9999,
        padding:      '4px 9px',
        background:   'rgba(10,10,14,0.92)',
        border:       `1px solid ${color}44`,
        borderRadius:  5,
        fontFamily:   'ui-monospace, "Cascadia Code", Menlo, monospace',
        fontSize:     10,
        fontWeight:   700,
        letterSpacing: '0.06em',
        color,
        cursor:       'pointer',
        boxShadow:    '0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      {snap.apiMode.toUpperCase()}
      {snap.requestCount > 0 && (
        <span style={{ color: '#64748b', marginLeft: 5 }}>·{snap.requestCount}</span>
      )}
    </button>
  )
}

// ─── Row helper ────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  valueColor = '#e2e8f0',
  truncate = false,
}: {
  label:      string
  value:      string
  valueColor?: string
  truncate?:  boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: '0.06em', flexShrink: 0 }}>
        {label.toUpperCase()}
      </span>
      <span
        style={{
          color: valueColor,
          flex:  1,
          ...(truncate
            ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
            : {}),
        }}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Root export ───────────────────────────────────────────────────────────

export function DevModeIndicator() {
  // Both hooks are always called (no conditional hook calls) so React's rules
  // are respected. IS_DEV is a build-time constant — the entire body of the
  // component is dead-code-eliminated in production.
  const [snap, setSnap] = useState<DiagnosticsSnapshot>(() =>
    IS_DEV ? diagnostics.snapshot() : {
      apiMode: 'mock', apiBaseUrl: '', registryImpl: 'MockEngineService',
      liveEngineInstantiated: false, requestCount: 0, lastRequest: null,
    }
  )
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (!IS_DEV) return
    const id = setInterval(() => setSnap(diagnostics.snapshot()), 1_000)
    return () => clearInterval(id)
  }, [])

  if (!IS_DEV) return null

  return expanded
    ? <Panel snap={snap} onCollapse={() => setExpanded(false)} />
    : <Badge snap={snap} onExpand={() => setExpanded(true)} />
}
