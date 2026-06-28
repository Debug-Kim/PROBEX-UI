'use client'

import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateTime } from '@/lib/utils'
import { AUDIT_LOG, type AuditEntry, type AuditSeverity } from '@/mock/admin'
import { AdminCard, StatusPill, TableWrap, SearchField, FilterPills, type Tone } from './shared'

const SEVERITY_TONE: Record<AuditSeverity, Tone> = {
  info: 'info', warning: 'warning', critical: 'negative',
}

type SeverityFilter = 'all' | AuditSeverity

export function AuditLogs() {
  const [query, setQuery]       = useState('')
  const [severity, setSeverity] = useState<SeverityFilter>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AUDIT_LOG.filter((e) => {
      if (severity !== 'all' && e.severity !== severity) return false
      if (!q) return true
      return e.action.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q) || e.target.toLowerCase().includes(q)
    })
  }, [query, severity])

  return (
    <AdminCard
      title="Audit Log"
      subtitle="Immutable record of operator and system actions"
      right={
        <div className="flex items-center gap-2">
          <SearchField value={query} onChange={setQuery} placeholder="Search actor, action, target…" />
          <button className="btn-ghost h-9 text-xs whitespace-nowrap">Export CSV</button>
        </div>
      }
      noPadding
    >
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <FilterPills<SeverityFilter>
          value={severity}
          onChange={setSeverity}
          options={[
            { id: 'all',      label: 'All' },
            { id: 'info',     label: 'Info' },
            { id: 'warning',  label: 'Warning' },
            { id: 'critical', label: 'Critical' },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<LogIcon />} title="No log entries" description="No events match the current filters." />
      ) : (
        <TableWrap label="Audit log">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Severity</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => <LogRow key={e.id} entry={e} />)}
          </tbody>
        </TableWrap>
      )}
    </AdminCard>
  )
}

function LogRow({ entry }: { entry: AuditEntry }) {
  return (
    <tr>
      <td><span className="text-2xs tabular-nums" style={{ color: 'var(--probex-text-muted)' }}>{formatDateTime(entry.timestamp)}</span></td>
      <td><StatusPill tone={SEVERITY_TONE[entry.severity]}>{entry.severity}</StatusPill></td>
      <td><span className="text-xs" style={{ color: 'var(--probex-text-secondary)' }}>{entry.actor}</span></td>
      <td><code className="text-2xs font-data px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--probex-primary)' }}>{entry.action}</code></td>
      <td><span className="text-xs font-data" style={{ color: 'var(--probex-text-secondary)' }}>{entry.target}</span></td>
      <td><span className="text-2xs font-data" style={{ color: 'var(--probex-text-muted)' }}>{entry.ip}</span></td>
    </tr>
  )
}

function LogIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
    </svg>
  )
}
