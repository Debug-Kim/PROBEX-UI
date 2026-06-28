'use client'

import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCentPrice, formatCompact, formatCurrency } from '@/lib/utils'
import { ADMIN_MARKETS, type AdminMarket, type AdminMarketStatus } from '@/mock/admin'
import { AdminCard, StatusPill, TableWrap, SearchField, FilterPills, MiniButton, type Tone } from './shared'

const STATUS_TONE: Record<AdminMarketStatus, Tone> = {
  open: 'positive', paused: 'warning', resolved: 'info', flagged: 'negative', draft: 'neutral',
}

type StatusFilter = 'all' | AdminMarketStatus

export function MarketManagement() {
  const [query, setQuery]   = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ADMIN_MARKETS.filter((m) => {
      if (status !== 'all' && m.status !== status) return false
      if (!q) return true
      return m.question.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.id.includes(q)
    })
  }, [query, status])

  const flaggedCount = ADMIN_MARKETS.filter((m) => m.status === 'flagged').length

  return (
    <div className="flex flex-col gap-4">
      {flaggedCount > 0 && (
        <div
          className="flex items-start gap-2.5 rounded-lg px-4 py-3"
          style={{ background: 'var(--probex-negative-dim)', border: '1px solid rgba(239,68,68,0.22)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--probex-negative)' }} aria-hidden="true">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-xs" style={{ color: 'var(--probex-text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--probex-negative)' }}>{flaggedCount} market flagged for review.</span>{' '}
            Flagged markets are still tradable until an operator pauses or resolves them.
          </p>
        </div>
      )}

      <AdminCard
        title="Market Management"
        subtitle={`${ADMIN_MARKETS.length} markets across ${new Set(ADMIN_MARKETS.map((m) => m.category)).size} categories`}
        right={
          <div className="flex items-center gap-2">
            <SearchField value={query} onChange={setQuery} placeholder="Search markets…" />
            <button className="btn-primary h-9 text-xs whitespace-nowrap">+ New Market</button>
          </div>
        }
        noPadding
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
          <FilterPills<StatusFilter>
            value={status}
            onChange={setStatus}
            options={[
              { id: 'all',      label: 'All' },
              { id: 'open',     label: 'Open' },
              { id: 'paused',   label: 'Paused' },
              { id: 'flagged',  label: 'Flagged' },
              { id: 'resolved', label: 'Resolved' },
              { id: 'draft',    label: 'Draft' },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<ChartIcon />} title="No markets match" description="Adjust your search or status filter." />
        ) : (
          <TableWrap label="Markets">
            <thead>
              <tr>
                <th>Market</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>YES</th>
                <th style={{ textAlign: 'right' }}>Volume</th>
                <th style={{ textAlign: 'right' }}>Open Int.</th>
                <th style={{ textAlign: 'right' }}>Traders</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => <MarketRow key={m.id} market={m} />)}
            </tbody>
          </TableWrap>
        )}
      </AdminCard>
    </div>
  )
}

function MarketRow({ market }: { market: AdminMarket }) {
  return (
    <tr>
      <td style={{ maxWidth: 360, whiteSpace: 'normal' }}>
        <span className="text-sm font-medium block" style={{ color: 'var(--probex-text-primary)' }}>{market.question}</span>
        <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>{market.category} · {market.id}</span>
        {market.flagged && (
          <span className="text-2xs block mt-0.5" style={{ color: 'var(--probex-negative)' }}>⚠ {market.flagged}</span>
        )}
      </td>
      <td><StatusPill tone={STATUS_TONE[market.status]}>{market.status}</StatusPill></td>
      <td style={{ textAlign: 'right' }} className="tabular-nums text-sm font-semibold" >{formatCentPrice(market.yesPrice)}</td>
      <td style={{ textAlign: 'right' }} className="tabular-nums text-sm">{formatCurrency(market.volumeUsd, true)}</td>
      <td style={{ textAlign: 'right' }} className="tabular-nums text-sm">{formatCurrency(market.openInterest, true)}</td>
      <td style={{ textAlign: 'right' }} className="tabular-nums text-sm">{formatCompact(market.traders)}</td>
      <td>
        <div className="flex items-center gap-1.5 justify-end">
          {market.status === 'open' && <MiniButton tone="warning" title="Pause trading">Pause</MiniButton>}
          {market.status === 'paused' && <MiniButton tone="positive" title="Resume trading">Resume</MiniButton>}
          {(market.status === 'open' || market.status === 'flagged') && <MiniButton tone="info" title="Resolve market">Resolve</MiniButton>}
          {market.status === 'draft' && <MiniButton tone="positive" title="Publish market">Publish</MiniButton>}
          <MiniButton tone="neutral" title="Edit">Edit</MiniButton>
        </div>
      </td>
    </tr>
  )
}

function ChartIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}
