'use client'

import { useRouter }           from 'next/navigation'
import { cn, formatCurrency, formatRelativeTime } from '@/lib/utils'
import type { Position, PositionStatus } from '@/types/wallet'
import { ALIGNMENT_LABELS, ALIGNMENT_COLORS, type PositionConsensus } from '@/lib/positions/alignment'
import { usePositionConsensus } from '@/hooks/useServices'
import { ConsensusBadge }      from '@/components/markets/ConsensusBadge'
import { usePortfolioStore, type PositionSortField } from '@/store/portfolioStore'
import { ROUTES }              from '@/config/constants'

interface PositionTableProps {
  positions:  Position[]
  isSettled?: boolean
  className?: string
}

// ─── Column definitions ────────────────────────────────────────────────────

interface ColumnDef {
  key:        string
  label:      string
  sortField?: PositionSortField
  width?:     string
  align?:     'left' | 'right' | 'center'
  hideOnMobile?: boolean
}

const OPEN_COLUMNS: ColumnDef[] = [
  { key: 'market',     label: 'Market',     width: 'flex-1', align: 'left' },
  { key: 'side',       label: 'Side',       sortField: 'side', width: 'w-16', align: 'center' },
  { key: 'entry',      label: 'Entry',      width: 'w-20', align: 'right' },
  { key: 'current',    label: 'Current',    width: 'w-20', align: 'right' },
  { key: 'consensus',  label: 'Consensus',  width: 'w-28', align: 'left', hideOnMobile: true },
  { key: 'value',      label: 'Value',      sortField: 'currentValue', width: 'w-24', align: 'right' },
  { key: 'pnl',        label: 'P&L',        sortField: 'unrealizedPnl', width: 'w-28', align: 'right' },
  { key: 'alignment',  label: 'Alignment',  width: 'w-28', align: 'left', hideOnMobile: true },
]

const SETTLED_COLUMNS: ColumnDef[] = [
  { key: 'market',     label: 'Market',     width: 'flex-1', align: 'left' },
  { key: 'side',       label: 'Side',       sortField: 'side', width: 'w-16', align: 'center' },
  { key: 'entry',      label: 'Entry',      width: 'w-20', align: 'right' },
  { key: 'result',     label: 'Result',     width: 'w-24', align: 'center' },
  { key: 'value',      label: 'Stake',      sortField: 'costBasis', width: 'w-24', align: 'right' },
  { key: 'pnl',        label: 'Realized P&L', sortField: 'unrealizedPnl', width: 'w-28', align: 'right' },
  { key: 'closed',     label: 'Settled', width: 'w-24', align: 'right', hideOnMobile: true },
]

/**
 * PositionTable
 * ─────────────
 * Dense sortable table for open or settled positions.
 * Consensus alignment is the rightmost column on open positions —
 * keeps the Probex differentiator visible while respecting Kalshi density.
 */
export function PositionTable({ positions, isSettled = false, className }: PositionTableProps) {
  const router = useRouter()
  const { sortBy, sortDir, setSort, selectedPositionId, openDetailPanel } = usePortfolioStore()
  const positionConsensus = usePositionConsensus()
  const columns = isSettled ? SETTLED_COLUMNS : OPEN_COLUMNS

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'var(--probex-text-muted)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
        </svg>
        <p className="text-sm">No {isSettled ? 'settled' : 'open'} positions match your filters</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--probex-border)' }}>
      <table className={cn('w-full border-collapse text-sm', className)}>
        <thead>
          <tr style={{ background: 'var(--probex-surface-2)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-3 py-2.5 text-left font-semibold select-none',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.sortField && 'cursor-pointer',
                  col.width,
                  col.hideOnMobile && 'hidden xl:table-cell',
                )}
                style={{
                  color: 'var(--probex-text-muted)', fontSize: '0.6875rem',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  borderBottom: '1px solid var(--probex-border)',
                }}
                onClick={() => col.sortField && setSort(col.sortField)}
                aria-sort={col.sortField && sortBy === col.sortField ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
              >
                <span className="flex items-center gap-1 justify-end" style={{ justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' }}>
                  {col.label}
                  {col.sortField && <SortIcon active={sortBy === col.sortField} dir={sortDir} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {positions.map((pos, idx) => (
            <PositionRow
              key={pos.id as string}
              position={pos}
              consensusFor={positionConsensus}
              isSettled={isSettled}
              isLast={idx === positions.length - 1}
              isSelected={selectedPositionId === (pos.id as string)}
              onClick={() => openDetailPanel(pos.id as string)}
              onNavigate={() => router.push(`${ROUTES.MARKETS}/${pos.marketId}`)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────

function PositionRow({
  position, consensusFor, isSettled, isLast, isSelected, onClick, onNavigate,
}: {
  position:     Position
  consensusFor: (position: Position) => PositionConsensus
  isSettled:    boolean
  isLast:       boolean
  isSelected:   boolean
  onClick:      () => void
  onNavigate:   () => void
}) {
  const { consensus, alignment } = consensusFor(position)
  const isYes     = position.side === 'yes'
  const sideColor = isYes ? 'var(--probex-yes)' : 'var(--probex-no)'
  const isProfit  = position.unrealizedPnl >= 0
  const pnlColor  = isProfit ? 'var(--probex-positive)' : 'var(--probex-negative)'

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer transition-colors duration-100"
      style={{
        background:   isSelected ? 'var(--probex-primary-dim)' : undefined,
        borderBottom: isLast ? 'none' : '1px solid var(--probex-border)',
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '' }}
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
    >
      {/* Market */}
      <td className="px-3 py-3">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate() }}
            className="text-left font-medium text-sm line-clamp-1 hover:underline cursor-pointer"
            style={{ color: 'var(--probex-text-primary)' }}
          >
            {position.marketTitle}
          </button>
          <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
            {position.contracts.toLocaleString()} contracts · opened {formatRelativeTime(position.openedAt)}
          </span>
        </div>
      </td>

      {/* Side */}
      <td className="px-3 py-3 w-16 text-center">
        <span
          className="text-2xs font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
          style={{ background: sideColor, color: isYes ? '#050816' : '#fff' }}
        >
          {position.side.toUpperCase()}
        </span>
      </td>

      {/* Entry */}
      <td className="px-3 py-3 w-20 text-right">
        <span className="text-sm tabular-nums" style={{ color: 'var(--probex-text-secondary)' }}>
          {position.entryPrice}¢
        </span>
      </td>

      {!isSettled ? (
        <>
          {/* Current */}
          <td className="px-3 py-3 w-20 text-right">
            <span className="text-sm font-semibold tabular-nums" style={{ color: sideColor }}>
              {position.currentPrice}¢
            </span>
          </td>

          {/* Consensus */}
          <td className="px-3 py-3 w-28 hidden xl:table-cell">
            {consensus ? <ConsensusBadge score={consensus.score} size="sm" /> : <span className="text-xs" style={{ color: 'var(--probex-text-disabled)' }}>—</span>}
          </td>

          {/* Value */}
          <td className="px-3 py-3 w-24 text-right">
            <span className="text-sm tabular-nums" style={{ color: 'var(--probex-text-primary)' }}>
              {formatCurrency(position.currentValue)}
            </span>
          </td>

          {/* P&L */}
          <td className="px-3 py-3 w-28 text-right">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm font-bold tabular-nums" style={{ color: pnlColor }}>
                {isProfit ? '+' : ''}{formatCurrency(position.unrealizedPnl)}
              </span>
              <span className="text-2xs tabular-nums" style={{ color: pnlColor }}>
                {isProfit ? '+' : ''}{(position.unrealizedPnlPct * 100).toFixed(1)}%
              </span>
            </div>
          </td>

          {/* Alignment */}
          <td className="px-3 py-3 w-28 hidden xl:table-cell">
            <span
              className="text-2xs font-semibold px-2 py-0.5 rounded whitespace-nowrap"
              style={{ background: `color-mix(in srgb, ${ALIGNMENT_COLORS[alignment]} 12%, transparent)`, color: ALIGNMENT_COLORS[alignment] }}
            >
              {ALIGNMENT_LABELS[alignment]}
            </span>
          </td>
        </>
      ) : (
        <>
          {/* Result */}
          <td className="px-3 py-3 w-24 text-center">
            <ResultBadge status={position.status} />
          </td>

          {/* Stake */}
          <td className="px-3 py-3 w-24 text-right">
            <span className="text-sm tabular-nums" style={{ color: 'var(--probex-text-primary)' }}>
              {formatCurrency(position.costBasis)}
            </span>
          </td>

          {/* Realized P&L */}
          <td className="px-3 py-3 w-28 text-right">
            <span className="text-sm font-bold tabular-nums" style={{ color: pnlColor }}>
              {isProfit ? '+' : ''}{formatCurrency(position.unrealizedPnl)}
            </span>
          </td>

          {/* Settled date */}
          <td className="px-3 py-3 w-24 text-right hidden xl:table-cell">
            <span className="text-xs" style={{ color: 'var(--probex-text-muted)' }}>
              {position.closedAt ? formatRelativeTime(position.closedAt) : '—'}
            </span>
          </td>
        </>
      )}
    </tr>
  )
}

// ─── Result Badge ──────────────────────────────────────────────────────────

function ResultBadge({ status }: { status: PositionStatus }) {
  if (status === 'settled-win') {
    return (
      <span className="text-2xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--probex-positive-dim)', color: 'var(--probex-positive)' }}>
        WIN
      </span>
    )
  }
  if (status === 'settled-loss') {
    return (
      <span className="text-2xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--probex-negative-dim)', color: 'var(--probex-negative)' }}>
        LOSS
      </span>
    )
  }
  return (
    <span className="text-2xs font-medium px-2 py-0.5 rounded" style={{ background: 'var(--probex-surface-2)', color: 'var(--probex-text-muted)' }}>
      SOLD
    </span>
  )
}

// ─── Sort Icon ──────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
      style={{ opacity: active ? 1 : 0.3, color: active ? 'var(--probex-primary)' : 'currentColor', transform: active && dir === 'asc' ? 'rotate(180deg)' : '' }}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}
