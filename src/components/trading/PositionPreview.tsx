'use client'

import {cn, formatCurrency} from '@/lib/utils'
import {useMarketStore}    from '@/store/marketStore'
import type { ConsensusState } from '@/types/consensus'

interface PositionPreviewProps {
  marketTitle: string
  yesPrice:    number
  noPrice:     number
  closesAt:    string
  consensus?:  ConsensusState | undefined
  className?:  string
}

/**
 * PositionPreview
 * ───────────────
 * Visual card showing what the position would look like in the portfolio.
 * Only shown when a valid stake amount is entered.
 * becomes a real position card after order placement.
 */
export function PositionPreview({
  marketTitle,
  yesPrice,
  noPrice,
  closesAt,
  className,
}: PositionPreviewProps) {
  const { stakeInput, activeOutcome } = useMarketStore()
  const stake = parseFloat(stakeInput) || 0

  if (stake <= 0) return null

  const isYes    = activeOutcome === 'yes'
  const price    = isYes ? yesPrice : noPrice
  const colorVar = isYes ? 'var(--probex-yes)' : 'var(--probex-no)'
  const payout   = parseFloat(((stake / price) * 100).toFixed(2))
  const profit   = payout - stake

  const closes = new Date(closesAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div
      className={cn('rounded-lg p-3 flex flex-col gap-2.5 animate-fade-in', className)}
      style={{
        background: `color-mix(in srgb, ${colorVar} 6%, var(--probex-surface-2))`,
        border:     `1px solid color-mix(in srgb, ${colorVar} 22%, transparent)`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-2xs font-black uppercase tracking-widest px-2 py-0.5 rounded"
          style={{
            background: colorVar,
            color:      isYes ? '#050816' : '#fff',
          }}
        >
          {activeOutcome.toUpperCase()}
        </span>
        <span className="text-xs font-medium truncate flex-1" style={{ color: 'var(--probex-text-secondary)' }}>
          {marketTitle}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>Stake</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--probex-text-primary)' }}>
            {formatCurrency(stake)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>Payout if correct</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--probex-positive)' }}>
            {formatCurrency(payout)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>Price</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: colorVar }}>
            {price}¢
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>Profit</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--probex-positive)' }}>
            +{formatCurrency(profit)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        Resolves {closes}
      </div>
    </div>
  )
}
