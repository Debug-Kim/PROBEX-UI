'use client'

import { cn }                from '@/lib/utils'
import { MOCK_FUNDING_METHODS, type FundingMethod } from '@/mock/fundingMethods'
import { useSelectedFundingMethod, useWalletStore } from '@/store/walletStore'

interface FundingMethodsProps {
  className?: string
  /** If true, clicking a method also opens the deposit flow */
  selectable?: boolean
}

/**
 * FundingMethods
 * ───────────────
 * Grid of available funding methods (USDC/Polygon, crypto transfer,
 * PayPal, bank transfer) with fees and settlement times.
 *
 * When `selectable`, clicking a method sets it as the selected
 * funding method and opens the deposit flow.
 */
export function FundingMethods({ className, selectable = true }: FundingMethodsProps) {
  const selected      = useSelectedFundingMethod()
  const setFundingMethod = useWalletStore((s) => s.setFundingMethod)
  const setFundingFlow   = useWalletStore((s) => s.setFundingFlow)

  const handleSelect = (method: FundingMethod) => {
    if (!selectable) return
    setFundingMethod(method.id)
    setFundingFlow('deposit')
  }

  return (
    <div className={cn('rounded-xl overflow-hidden', className)} style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>
          Funding Methods
        </h2>
      </div>

      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {MOCK_FUNDING_METHODS.map((method) => {
          const isSelected = selected === method.id
          return (
            <button
              key={method.id}
              onClick={() => handleSelect(method)}
              disabled={!method.isAvailable}
              className={cn(
                'flex flex-col gap-2 p-3 rounded-lg text-left transition-all duration-100',
                selectable && method.isAvailable ? 'cursor-pointer' : 'cursor-default',
                !method.isAvailable && 'opacity-50',
              )}
              style={isSelected ? {
                background:  'var(--probex-primary-dim)',
                border:      '1px solid var(--probex-yes-border)',
              } : {
                background:  'var(--probex-surface-2)',
                border:      '1px solid var(--probex-border)',
              }}
              onMouseEnter={(e) => {
                if (selectable && method.isAvailable && !isSelected) e.currentTarget.style.borderColor = 'var(--probex-border-active)'
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--probex-border)'
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-2xs font-black flex-shrink-0"
                  style={{
                    background: method.category === 'crypto' ? 'var(--probex-primary-dim)' : 'var(--probex-surface-3)',
                    color:      method.category === 'crypto' ? 'var(--probex-primary)' : 'var(--probex-text-secondary)',
                  }}
                  aria-hidden="true"
                >
                  {method.iconLabel}
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold truncate" style={{ color: 'var(--probex-text-primary)' }}>
                    {method.name}
                  </span>
                  <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>
                    {method.settlementTime}
                  </span>
                </div>
                {isSelected && (
                  <span
                    className="ml-auto flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--probex-primary)' }}
                    aria-label="Selected"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#050816" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </div>

              <p className="text-2xs leading-relaxed" style={{ color: 'var(--probex-text-muted)' }}>
                {method.description}
              </p>

              <div className="flex items-center justify-between text-2xs pt-1" style={{ borderTop: '1px solid var(--probex-border)' }}>
                <span style={{ color: 'var(--probex-text-disabled)' }}>
                  {method.feeLabel}
                </span>
                <span style={{ color: 'var(--probex-text-disabled)' }}>
                  ${method.minAmount.toLocaleString()} – ${method.maxAmount.toLocaleString()}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
