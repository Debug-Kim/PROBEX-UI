'use client'

import { cn }              from '@/lib/utils'
import { useMarketStore }  from '@/store/marketStore'
import type { ChangeEvent } from 'react'

const QUICK_AMOUNTS = [10, 25, 50, 100, 250] as const

interface StakeInputProps {
  className?: string
}

/**
 * StakeInput
 * ──────────
 * Dollar amount input for the trading drawer.
 * Includes quick-fill buttons for common amounts.
 * validate against wallet balance and limits.
 */
export function StakeInput({ className }: StakeInputProps) {
  const { stakeInput, setStakeInput } = useMarketStore()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    // Allow only valid numeric input
    if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
      setStakeInput(raw)
    }
  }

  const handleQuick = (amount: number) => {
    setStakeInput(amount.toString())
  }

  const numericValue = parseFloat(stakeInput) || 0

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        className="text-xs font-semibold uppercase tracking-wider"
        htmlFor="stake-input"
        style={{ color: 'var(--probex-text-muted)' }}
      >
        Amount
      </label>

      {/* Main input */}
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none"
          style={{ color: 'var(--probex-text-secondary)' }}
          aria-hidden="true"
        >
          $
        </span>
        <input
          id="stake-input"
          type="text"
          inputMode="decimal"
          value={stakeInput}
          onChange={handleChange}
          placeholder="0.00"
          className={cn(
            'w-full h-11 pl-7 pr-4 rounded-lg text-base font-semibold tabular-nums',
            'transition-colors duration-150 outline-none',
          )}
          style={{
            background:  'var(--probex-surface-2)',
            border:      `1px solid ${numericValue > 0 ? 'var(--probex-border-active)' : 'var(--probex-border-default)'}`,
            color:       'var(--probex-text-primary)',
          }}
          aria-label="Stake amount in USD"
        />
        {stakeInput && (
          <button
            onClick={() => setStakeInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: 'var(--probex-text-muted)' }}
            aria-label="Clear amount"
            type="button"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Quick amounts */}
      <div className="flex gap-1.5" role="group" aria-label="Quick stake amounts">
        {QUICK_AMOUNTS.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => handleQuick(amt)}
            className={cn(
              'flex-1 text-xs font-semibold py-1.5 rounded-md cursor-pointer transition-all duration-100',
            )}
            style={numericValue === amt ? {
              background:  'var(--probex-primary-dim)',
              color:       'var(--probex-primary)',
              border:      '1px solid var(--probex-yes-border)',
            } : {
              background:  'var(--probex-surface-2)',
              color:       'var(--probex-text-muted)',
              border:      '1px solid var(--probex-border)',
            }}
            aria-pressed={numericValue === amt}
          >
            ${amt}
          </button>
        ))}
      </div>
    </div>
  )
}
