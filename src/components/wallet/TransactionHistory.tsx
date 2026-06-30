'use client'

import { useMemo, useState }     from 'react'
import { cn, formatCurrency, formatRelativeTime } from '@/lib/utils'
import { useTransactions }        from '@/hooks/useServices'
import { explorerTxUrl }          from '@/lib/web3/utils/formatAddress'
import { getActiveChainConfig }   from '@/lib/web3/utils/chainConfig'
import { useWalletStore }         from '@/store/walletStore'
import { TableRowSkeleton }       from '@/components/ui/LoadingState'
import type { Transaction, TransactionType, TransactionStatus } from '@/types/wallet'
import type { ReactNode } from 'react'

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  deposit:           'Deposit',
  withdrawal:        'Withdrawal',
  'buy-yes':         'Buy YES',
  'buy-no':          'Buy NO',
  'sell-yes':        'Sell YES',
  'sell-no':         'Sell NO',
  'settlement-win':  'Settlement (Win)',
  'settlement-loss': 'Settlement (Loss)',
  fee:               'Fee',
}

const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  deposit:           'var(--probex-positive)',
  withdrawal:        'var(--probex-warning)',
  'buy-yes':         'var(--probex-yes)',
  'buy-no':          'var(--probex-no)',
  'sell-yes':        'var(--probex-yes)',
  'sell-no':         'var(--probex-no)',
  'settlement-win':  'var(--probex-positive)',
  'settlement-loss': 'var(--probex-negative)',
  fee:               'var(--probex-text-muted)',
}

const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  pending:    'Pending',
  confirming: 'Confirming',
  confirmed:  'Confirmed',
  failed:     'Failed',
}

const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, string> = {
  pending:    'var(--probex-warning)',
  confirming: 'var(--probex-primary)',
  confirmed:  'var(--probex-positive)',
  failed:     'var(--probex-negative)',
}

type SortField = 'createdAt' | 'amount'

/**
 * TransactionHistory
 * ────────────────────
 * Full transaction history table.
 * Columns: Date · Type · Amount · Status · Method/Market · Reference (tx hash)
 *
 * Filters live in walletStore (txTypeFilter, txStatusFilter, txSearch)
 * so they persist if the user navigates away and back.
 * Sort is local component state (simple two-field sort).
 */
export function TransactionHistory({ className, isLoading }: { className?: string; isLoading?: boolean }) {
  const { txTypeFilter, txStatusFilter, txSearch, setTxTypeFilter, setTxStatusFilter, setTxSearch, resetTxFilters } = useWalletStore()
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('desc')

  const allTransactions = useTransactions().data ?? []
  const chain = getActiveChainConfig()

  const filtered = useMemo(() => {
    let result = allTransactions

    if (txTypeFilter)   result = result.filter((t) => t.type === txTypeFilter)
    if (txStatusFilter) result = result.filter((t) => t.status === txStatusFilter)

    if (txSearch.trim()) {
      const q = txSearch.toLowerCase()
      result = result.filter((t) =>
        TRANSACTION_TYPE_LABELS[t.type].toLowerCase().includes(q) ||
        (t.marketTitle ?? '').toLowerCase().includes(q) ||
        (t.txHash ?? '').toLowerCase().includes(q)
      )
    }

    result = [...result].sort((a, b) => {
      const valA = sortField === 'amount' ? a.amount : new Date(a.createdAt).getTime()
      const valB = sortField === 'amount' ? b.amount : new Date(b.createdAt).getTime()
      return sortDir === 'desc' ? valB - valA : valA - valB
    })

    return result
  }, [allTransactions, txTypeFilter, txStatusFilter, txSearch, sortField, sortDir])

  const hasActiveFilter = !!(txTypeFilter || txStatusFilter || txSearch)

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === 'desc' ? 'asc' : 'desc')
    else { setSortField(field); setSortDir('desc') }
  }

  const typeOptions: TransactionType[] = ['deposit', 'withdrawal', 'buy-yes', 'buy-no', 'settlement-win', 'settlement-loss', 'fee']
  const statusOptions: TransactionStatus[] = ['pending', 'confirming', 'confirmed', 'failed']

  return (
    <div className={cn('rounded-xl overflow-hidden', className)} style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>

      {/* Header */}
      <div className="px-4 py-3 flex flex-col gap-2.5" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>
            Transaction History
          </h2>
          <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>
            {filtered.length} of {allTransactions.length}
          </span>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ color: 'var(--probex-text-muted)' }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              placeholder="Search transactions…"
              className="input-base h-8 pl-8 pr-3 text-sm w-full"
              aria-label="Search transactions"
            />
          </div>

          {/* Type filter */}
          <select
            value={txTypeFilter ?? ''}
            onChange={(e) => setTxTypeFilter(e.target.value ? e.target.value as TransactionType : null)}
            className="h-8 px-2.5 text-xs rounded-md cursor-pointer"
            style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)', color: 'var(--probex-text-secondary)' }}
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            {typeOptions.map((t) => <option key={t} value={t}>{TRANSACTION_TYPE_LABELS[t]}</option>)}
          </select>

          {/* Status filter */}
          <select
            value={txStatusFilter ?? ''}
            onChange={(e) => setTxStatusFilter(e.target.value ? e.target.value as TransactionStatus : null)}
            className="h-8 px-2.5 text-xs rounded-md cursor-pointer"
            style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)', color: 'var(--probex-text-secondary)' }}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => <option key={s} value={s}>{TRANSACTION_STATUS_LABELS[s]}</option>)}
          </select>

          {hasActiveFilter && (
            <button
              onClick={resetTxFilters}
              className="text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-100"
              style={{ background: 'var(--probex-negative-dim)', color: 'var(--probex-negative)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody><TableRowSkeleton columns={6} rows={6} /></tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'var(--probex-text-muted)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" />
          </svg>
          <p className="text-sm">No transactions match your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ background: 'var(--probex-surface-2)' }}>
                <Th onClick={() => toggleSort('createdAt')} active={sortField === 'createdAt'} dir={sortDir}>Date</Th>
                <Th>Type</Th>
                <Th onClick={() => toggleSort('amount')} active={sortField === 'amount'} dir={sortDir} align="right">Amount</Th>
                <Th>Status</Th>
                <Th hideOnMobile>Method / Market</Th>
                <Th hideOnMobile align="right">Reference</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <TxRow key={t.id as string} tx={t} isLast={idx === filtered.length - 1} explorerUrl={chain.blockExplorerUrl} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Table Header Cell ──────────────────────────────────────────────────

function Th({
  children, onClick, active, dir, align = 'left', hideOnMobile,
}: {
  children: ReactNode
  onClick?: () => void
  active?:  boolean
  dir?:     'asc' | 'desc'
  align?:   'left' | 'right'
  hideOnMobile?: boolean
}) {
  return (
    <th
      className={cn(
        'px-3 py-2.5 font-semibold select-none',
        align === 'right' ? 'text-right' : 'text-left',
        onClick && 'cursor-pointer',
        hideOnMobile && 'hidden lg:table-cell',
      )}
      style={{
        color: 'var(--probex-text-muted)', fontSize: '0.6875rem',
        letterSpacing: '0.06em', textTransform: 'uppercase',
        borderBottom: '1px solid var(--probex-border)',
      }}
      onClick={onClick}
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      <span className="flex items-center gap-1" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        {children}
        {onClick && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
            style={{ opacity: active ? 1 : 0.3, color: active ? 'var(--probex-primary)' : 'currentColor', transform: active && dir === 'asc' ? 'rotate(180deg)' : '' }}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        )}
      </span>
    </th>
  )
}

// ─── Transaction Row ──────────────────────────────────────────────────────

function TxRow({ tx, isLast, explorerUrl }: { tx: Transaction; isLast: boolean; explorerUrl: string }) {
  const typeColor   = TRANSACTION_TYPE_COLORS[tx.type]
  const statusColor = TRANSACTION_STATUS_COLORS[tx.status]
  const isPositive  = tx.amount >= 0

  return (
    <tr style={{ borderBottom: isLast ? 'none' : '1px solid var(--probex-border)' }}>
      {/* Date */}
      <td className="px-3 py-3">
        <span className="text-xs" style={{ color: 'var(--probex-text-secondary)' }}>
          {formatRelativeTime(tx.createdAt)}
        </span>
      </td>

      {/* Type */}
      <td className="px-3 py-3">
        <span className="text-2xs font-semibold px-2 py-0.5 rounded whitespace-nowrap" style={{ background: `color-mix(in srgb, ${typeColor} 12%, transparent)`, color: typeColor }}>
          {TRANSACTION_TYPE_LABELS[tx.type]}
        </span>
      </td>

      {/* Amount */}
      <td className="px-3 py-3 text-right">
        <span className="text-sm font-bold tabular-nums" style={{ color: isPositive ? 'var(--probex-positive)' : 'var(--probex-negative)' }}>
          {isPositive ? '+' : ''}{formatCurrency(tx.amount)}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <span className="text-2xs font-semibold px-2 py-0.5 rounded whitespace-nowrap" style={{ background: `color-mix(in srgb, ${statusColor} 12%, transparent)`, color: statusColor }}>
          {TRANSACTION_STATUS_LABELS[tx.status]}
        </span>
      </td>

      {/* Method / Market */}
      <td className="px-3 py-3 hidden lg:table-cell">
        <span className="text-xs truncate max-w-[220px] block" style={{ color: 'var(--probex-text-secondary)' }}>
          {tx.marketTitle ?? (tx.type === 'deposit' || tx.type === 'withdrawal' ? 'USDC · Polygon' : '—')}
        </span>
      </td>

      {/* Reference */}
      <td className="px-3 py-3 text-right hidden lg:table-cell">
        {tx.txHash ? (
          <a
            href={explorerTxUrl(tx.txHash as string, explorerUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono cursor-pointer transition-colors duration-100"
            style={{ color: 'var(--probex-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--probex-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--probex-text-muted)' }}
          >
            {(tx.txHash as string).slice(0, 6)}…{(tx.txHash as string).slice(-4)}
          </a>
        ) : (
          <span className="text-xs" style={{ color: 'var(--probex-text-disabled)' }}>—</span>
        )}
      </td>
    </tr>
  )
}
