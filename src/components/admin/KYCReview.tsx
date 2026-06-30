'use client'

import { useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRelativeTime } from '@/lib/utils'
import { useKYCQueue } from '@/hooks/useServices'
import type { KYCApplication } from '@/types/admin'
import { AdminCard, StatusPill, MiniButton } from './shared'

type Decision = 'approved' | 'rejected'

function riskColor(score: number): string {
  if (score >= 60) return 'var(--probex-negative)'
  if (score >= 35) return 'var(--probex-warning)'
  return 'var(--probex-positive)'
}

const DOC_LABEL: Record<KYCApplication['documentType'], string> = {
  passport: 'Passport', 'national-id': 'National ID', 'drivers-license': "Driver's License",
}

export function KYCReview() {
  const [resolved, setResolved] = useState<Record<string, Decision>>({})

  const queue   = useKYCQueue().data ?? []
  const pending = queue.filter((a) => !resolved[a.id])

  return (
    <AdminCard
      title="KYC Review Queue"
      subtitle={`${pending.length} application${pending.length === 1 ? '' : 's'} awaiting decision`}
      right={
        Object.keys(resolved).length > 0
          ? <button className="btn-ghost h-9 text-xs" onClick={() => setResolved({})}>Reset queue</button>
          : undefined
      }
      noPadding
    >
      {pending.length === 0 ? (
        <EmptyState
          icon={<ShieldCheckIcon />}
          title="Queue cleared"
          description="All KYC applications have been reviewed. New submissions will appear here."
          action={<button className="btn-ghost h-9 text-xs" onClick={() => setResolved({})}>Reset demo queue</button>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-4">
          {pending.map((app) => (
            <KYCCard
              key={app.id}
              app={app}
              onDecision={(d) => setResolved((r) => ({ ...r, [app.id]: d }))}
            />
          ))}
        </div>
      )}
    </AdminCard>
  )
}

function KYCCard({ app, onDecision }: { app: KYCApplication; onDecision: (d: Decision) => void }) {
  return (
    <div className="rounded-lg p-4 flex flex-col gap-3" style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold" style={{ color: 'var(--probex-text-primary)' }}>{app.name}</span>
          <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>{app.userId} · {app.country} · {DOC_LABEL[app.documentType]}</span>
        </div>
        <StatusPill tone={app.status === 'requires_review' ? 'warning' : 'info'} dot={false}>
          {app.status.replace('_', ' ')}
        </StatusPill>
      </div>

      {/* Risk score */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>Risk score</span>
          <span className="text-xs font-bold tabular-nums" style={{ color: riskColor(app.riskScore) }}>
            {app.riskScore}/100
          </span>
        </div>
        <div className="prob-bar">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${app.riskScore}%`, background: riskColor(app.riskScore) }}
          />
        </div>
      </div>

      {/* Flags */}
      {app.flags.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {app.flags.map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-2xs" style={{ color: 'var(--probex-warning)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-2xs" style={{ color: 'var(--probex-positive)' }}>✓ No automated flags raised</span>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>{formatRelativeTime(app.submittedAt)}</span>
        <div className="flex items-center gap-1.5">
          <MiniButton tone="neutral" title="Request more documents">Request docs</MiniButton>
          <MiniButton tone="negative" onClick={() => onDecision('rejected')} title="Reject application">Reject</MiniButton>
          <MiniButton tone="positive" onClick={() => onDecision('approved')} title="Approve application">Approve</MiniButton>
        </div>
      </div>
    </div>
  )
}

function ShieldCheckIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
    </svg>
  )
}
