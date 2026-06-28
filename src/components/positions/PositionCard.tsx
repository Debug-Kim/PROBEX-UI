'use client'

import { useRouter }          from 'next/navigation'
import { cn, formatCurrency } from '@/lib/utils'
import type { Position }      from '@/types/wallet'
import { getPositionConsensus, ALIGNMENT_LABELS, ALIGNMENT_COLORS } from '@/mock/positionConsensus'
import { ConsensusBadge }     from '@/components/markets/ConsensusBadge'
import { ROUTES }             from '@/config/constants'

interface PositionCardProps {
  position:   Position
  className?: string
}

/**
 * PositionCard
 * ────────────
 * Compact card representation of a single position.
 * Used in grid layouts and the portfolio overview.
 *
 * Displays:
 *   Market title + segment + side badge
 *   Entry probability → Current probability
 *   Stake / Current value
 *   Unrealized P&L (color-coded)
 *   Consensus alignment chip
 */
export function PositionCard({ position, className }: PositionCardProps) {
  const router = useRouter()
  const { consensus, alignment } = getPositionConsensus(position)

  const isYes      = position.side === 'yes'
  const sideColor  = isYes ? 'var(--probex-yes)' : 'var(--probex-no)'
  const isProfit   = position.unrealizedPnl >= 0
  const pnlColor   = isProfit ? 'var(--probex-positive)' : 'var(--probex-negative)'
  const isSettled  = position.status !== 'open'

  const entryProb   = position.entryPrice
  const currentProb = position.currentPrice

  const handleClick = () => {
    router.push(`${ROUTES.MARKETS}/${position.marketId}`)
  }

  return (
    <article
      className={cn(
        'flex flex-col gap-3 p-4 rounded-lg cursor-pointer transition-all duration-150',
        className,
      )}
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
      onClick={handleClick}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--probex-border-active)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--probex-border)' }}
      role="button"
      tabIndex={0}
      aria-label={`View ${position.marketTitle}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}
    >
      {/* Top row: side badge + segment + consensus */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-2xs font-black uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ background: sideColor, color: isYes ? '#050816' : '#fff' }}
        >
          {position.side.toUpperCase()}
        </span>
        {consensus && <ConsensusBadge score={consensus.score} size="sm" />}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: 'var(--probex-text-primary)' }}>
        {position.marketTitle}
      </h3>

      {/* Probability movement */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>Entry</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--probex-text-secondary)' }}>{entryProb}%</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--probex-text-disabled)' }} aria-hidden="true">
          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>{isSettled ? 'Settled' : 'Current'}</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: sideColor }}>{currentProb}%</span>
        </div>

        {/* P&L — pushed right */}
        <div className="flex flex-col gap-0.5 ml-auto items-end">
          <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
            {isSettled ? 'Realized' : 'Unrealized'} P&amp;L
          </span>
          <span className="text-sm font-bold tabular-nums" style={{ color: pnlColor }}>
            {isProfit ? '+' : ''}{formatCurrency(position.unrealizedPnl)}
          </span>
        </div>
      </div>

      {/* Footer: value + alignment */}
      <div className="flex items-center justify-between pt-2.5 border-t" style={{ borderColor: 'var(--probex-border)' }}>
        <div className="flex items-center gap-3 text-xs">
          <span style={{ color: 'var(--probex-text-muted)' }}>
            Stake <strong style={{ color: 'var(--probex-text-secondary)' }}>{formatCurrency(position.costBasis)}</strong>
          </span>
          <span style={{ color: 'var(--probex-text-muted)' }}>
            Value <strong style={{ color: 'var(--probex-text-secondary)' }}>{formatCurrency(position.currentValue)}</strong>
          </span>
        </div>
        <span
          className="text-2xs font-semibold px-2 py-0.5 rounded"
          style={{ background: `color-mix(in srgb, ${ALIGNMENT_COLORS[alignment]} 12%, transparent)`, color: ALIGNMENT_COLORS[alignment] }}
        >
          {ALIGNMENT_LABELS[alignment]}
        </span>
      </div>
    </article>
  )
}
