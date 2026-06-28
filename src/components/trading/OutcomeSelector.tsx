'use client'

import { cn }                from '@/lib/utils'
import { useMarketStore }    from '@/store/marketStore'

interface OutcomeSelectorProps {
  yesPrice:   number   // cents
  noPrice:    number   // cents
  className?: string
}

/**
 * OutcomeSelector
 * ───────────────
 * YES / NO side selection. Two large toggle buttons.
 * Selected side drives the rest of the trading drawer calculations.
 * connects to order placement.
 */
export function OutcomeSelector({ yesPrice, noPrice, className }: OutcomeSelectorProps) {
  const { activeOutcome, setActiveOutcome } = useMarketStore()

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      <OutcomeButton
        side="yes"
        price={yesPrice}
        isActive={activeOutcome === 'yes'}
        onClick={() => setActiveOutcome('yes')}
      />
      <OutcomeButton
        side="no"
        price={noPrice}
        isActive={activeOutcome === 'no'}
        onClick={() => setActiveOutcome('no')}
      />
    </div>
  )
}

// ─── Single button ────────────────────────────────────────────────────────

interface OutcomeButtonProps {
  side:     'yes' | 'no'
  price:    number
  isActive: boolean
  onClick:  () => void
}

function OutcomeButton({ side, price, isActive, onClick }: OutcomeButtonProps) {
  const isYes      = side === 'yes'
  const colorVar   = isYes ? 'var(--probex-yes)' : 'var(--probex-no)'
  const dimVar     = isYes ? 'var(--probex-yes-dim)' : 'var(--probex-no-dim)'
  const borderVar  = isYes ? 'var(--probex-yes-border)' : 'var(--probex-no-border)'
  const gradVar    = isYes ? 'var(--probex-gradient-yes)' : 'var(--probex-gradient-no)'
  const label      = isYes ? 'YES' : 'NO'

  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Select ${label} at ${price}¢`}
      className={cn(
        'flex flex-col items-center gap-1 py-3 px-2 rounded-lg cursor-pointer',
        'transition-all duration-150 border-2',
      )}
      style={isActive ? {
        background:   dimVar,
        borderColor:  colorVar,
        boxShadow:    `0 0 12px color-mix(in srgb, ${colorVar} 20%, transparent)`,
      } : {
        background:  'var(--probex-surface-2)',
        borderColor: borderVar,
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.borderColor = colorVar
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.borderColor = borderVar
      }}
    >
      <span
        className="text-xs font-black tracking-widest uppercase"
        style={{ color: isActive ? colorVar : 'var(--probex-text-muted)' }}
      >
        {label}
      </span>
      <span
        className="text-2xl font-black tabular-nums"
        style={{ color: isActive ? colorVar : 'var(--probex-text-secondary)' }}
      >
        {price}¢
      </span>
      <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
        per contract
      </span>
      {isActive && (
        <span
          className="text-2xs font-semibold px-2 py-0.5 rounded-full mt-0.5"
          style={{ background: gradVar, color: isYes ? '#050816' : '#fff' }}
        >
          Selected
        </span>
      )}
    </button>
  )
}
