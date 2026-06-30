'use client'

import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { useAdminUsers } from '@/hooks/useServices'
import type { AdminUser, AdminUserStatus } from '@/types/admin'
import { AdminCard, StatusPill, TableWrap, SearchField, FilterPills, MiniButton, type Tone } from './shared'

const STATUS_TONE: Record<AdminUserStatus, Tone> = {
  active: 'positive', pending: 'warning', suspended: 'warning', banned: 'negative',
}

const KYC_TONE: Record<string, Tone> = {
  approved: 'positive', pending: 'warning', requires_review: 'warning', rejected: 'negative', not_started: 'neutral',
}

type StatusFilter = 'all' | AdminUserStatus
type ActionKind = 'suspend' | 'activate' | 'ban'

const ACTION_COPY: Record<ActionKind, { verb: string; tone: 'default' | 'danger'; next: AdminUserStatus; desc: (n: string) => string }> = {
  suspend:  { verb: 'Suspend',  tone: 'danger',  next: 'suspended', desc: (n) => `${n} will be unable to trade or withdraw until reactivated. This can be reversed.` },
  activate: { verb: 'Activate', tone: 'default', next: 'active',    desc: (n) => `${n} will regain full access to trading and withdrawals.` },
  ban:      { verb: 'Ban',      tone: 'danger',  next: 'banned',    desc: (n) => `${n} will be permanently banned and all open positions force-closed. This is hard to reverse.` },
}

export function UserManagement() {
  const [query, setQuery]     = useState('')
  const [status, setStatus]   = useState<StatusFilter>('all')
  const [overrides, setOverrides] = useState<Record<string, AdminUserStatus>>({})
  const [pending, setPending] = useState<{ user: AdminUser; action: ActionKind } | null>(null)
  const [applying, setApplying] = useState(false)

  const allUsers = useAdminUsers().data ?? []

  const effectiveStatus = (u: AdminUser): AdminUserStatus => overrides[u.id] ?? u.status

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allUsers.filter((u) => {
      if (status !== 'all' && effectiveStatus(u) !== status) return false
      if (!q) return true
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.includes(q)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUsers, query, status, overrides])

  const counts = useMemo(() => {
    const by = (s: AdminUserStatus) => allUsers.filter((u) => effectiveStatus(u) === s).length
    return { all: allUsers.length, active: by('active'), pending: by('pending'), suspended: by('suspended'), banned: by('banned') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUsers, overrides])

  const confirmAction = async () => {
    if (!pending) return
    setApplying(true)
    await new Promise((r) => setTimeout(r, 700))
    setOverrides((o) => ({ ...o, [pending.user.id]: ACTION_COPY[pending.action].next }))
    setApplying(false)
    setPending(null)
  }

  return (
    <>
      <AdminCard
        title="User Management"
        subtitle={`${allUsers.length} of 28,412 accounts · sample page`}
        right={<SearchField value={query} onChange={setQuery} placeholder="Search name, email, ID…" />}
        noPadding
      >
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap" style={{ borderBottom: '1px solid var(--probex-border)' }}>
          <FilterPills<StatusFilter>
            value={status}
            onChange={setStatus}
            options={[
              { id: 'all',       label: 'All',       count: counts.all },
              { id: 'active',    label: 'Active',    count: counts.active },
              { id: 'pending',   label: 'Pending',   count: counts.pending },
              { id: 'suspended', label: 'Suspended', count: counts.suspended },
              { id: 'banned',    label: 'Banned',    count: counts.banned },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<UsersIcon />}
            title="No users match your filters"
            description="Try a different search term or clear the status filter."
          />
        ) : (
          <TableWrap label="Users">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>KYC</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
                <th style={{ textAlign: 'right' }}>Lifetime Vol.</th>
                <th>Last active</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  status={effectiveStatus(u)}
                  onAction={(action) => setPending({ user: u, action })}
                />
              ))}
            </tbody>
          </TableWrap>
        )}
      </AdminCard>

      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={confirmAction}
        loading={applying}
        tone={pending ? ACTION_COPY[pending.action].tone : 'default'}
        title={pending ? `${ACTION_COPY[pending.action].verb} ${pending.user.name}?` : ''}
        description={pending ? ACTION_COPY[pending.action].desc(pending.user.name.split(' ')[0] ?? 'This user') : undefined}
        confirmLabel={pending ? ACTION_COPY[pending.action].verb : 'Confirm'}
      />
    </>
  )
}

function UserRow({ user, status, onAction }: { user: AdminUser; status: AdminUserStatus; onAction: (a: ActionKind) => void }) {
  return (
    <tr>
      <td>
        <div className="flex items-center gap-2.5">
          <Avatar name={user.name} />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--probex-text-primary)' }}>{user.name}</span>
            <span className="text-2xs truncate" style={{ color: 'var(--probex-text-muted)' }}>{user.email}</span>
          </div>
        </div>
      </td>
      <td><span className="text-xs capitalize" style={{ color: 'var(--probex-text-secondary)' }}>{user.role}</span></td>
      <td><StatusPill tone={STATUS_TONE[status]}>{status}</StatusPill></td>
      <td><StatusPill tone={KYC_TONE[user.kyc] ?? 'neutral'} dot={false}>{user.kyc.replace('_', ' ')}</StatusPill></td>
      <td style={{ textAlign: 'right' }} className="tabular-nums text-sm">{formatCurrency(user.balanceUsd)}</td>
      <td style={{ textAlign: 'right' }} className="tabular-nums text-sm">{formatCurrency(user.lifetimeVolume, true)}</td>
      <td><span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>{formatRelativeTime(user.lastActiveAt)}</span></td>
      <td>
        <div className="flex items-center gap-1.5 justify-end">
          {status === 'active'
            ? <Tooltip content="Suspend trading & withdrawals"><MiniButton tone="warning" onClick={() => onAction('suspend')}>Suspend</MiniButton></Tooltip>
            : status !== 'banned'
              ? <Tooltip content="Restore full access"><MiniButton tone="positive" onClick={() => onAction('activate')}>Activate</MiniButton></Tooltip>
              : null}
          {status !== 'banned' && (
            <Tooltip content="Permanently ban account"><MiniButton tone="negative" onClick={() => onAction('ban')}>Ban</MiniButton></Tooltip>
          )}
          <MiniButton tone="neutral" title="View profile">View</MiniButton>
        </div>
      </td>
    </tr>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center text-2xs font-bold flex-shrink-0"
      style={{ background: 'var(--probex-primary-dim)', color: 'var(--probex-primary)' }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

function UsersIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
