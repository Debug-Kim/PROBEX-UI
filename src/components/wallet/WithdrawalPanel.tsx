'use client'

import { useState }              from 'react'
import { cn, formatCurrency }    from '@/lib/utils'
import { getFundingMethod, getFundingMethodsByCategory } from '@/lib/wallet/fundingMethods'
import { useWalletBalance, useWalletConnection } from '@/hooks/useServices'
import { formatAddress }         from '@/lib/web3/utils/formatAddress'
import { useWalletStore, useSelectedFundingMethod } from '@/store/walletStore'
import { SummaryRow, Spinner }   from './DepositPanel'
import type { CSSProperties } from 'react'

const QUICK_PCTS = [25, 50, 75, 100] as const

/**
 * WithdrawalPanel
 * ───────────────
 * Withdrawal flow: select destination → enter amount → review summary.
 * Validates against available USDC balance. Mock actions only.
 */
export function WithdrawalPanel({ className, hideHeader = false, style }: { className?: string; hideHeader?: boolean; style?: CSSProperties }) {
  const selectedMethodId = useSelectedFundingMethod()
  const { withdrawalAmount, setWithdrawalAmount, setFundingMethod, setFundingFlow, resetFundingInputs } = useWalletStore()
  const [submitted, setSubmitted]       = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const balance     = useWalletBalance().data
  const connection  = useWalletConnection().data
  const method      = selectedMethodId ? getFundingMethod(selectedMethodId) : undefined
  const amount      = parseFloat(withdrawalAmount) || 0
  const available   = balance?.usdcBalance ?? 0

  const feeAmount   = method?.feeLabel.includes('%')
    ? amount * (parseFloat(method.feeLabel) / 100)
    : 0
  const netAmount   = Math.max(0, amount - feeAmount)

  const exceedsBalance = amount > available
  const isValid = !!method && amount > 0 && !exceedsBalance && (!method.minAmount || amount >= method.minAmount)

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const handleClose = () => {
    resetFundingInputs()
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className={cn('rounded-xl p-5 flex flex-col items-center gap-3 text-center', className)}
        style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--probex-warning)' }}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--probex-text-primary)' }}>Withdrawal requested</p>
          <p className="text-xs mt-1" style={{ color: 'var(--probex-text-muted)' }}>
            {formatCurrency(amount)} via {method?.name} · {method?.settlementTime}
          </p>
        </div>
        <button onClick={handleClose} className="btn-ghost px-5 py-2 text-sm">Done</button>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl overflow-hidden', className)} style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)', ...style }}>
      {!hideHeader && (
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>Withdraw Funds</h2>
        <button
          onClick={() => setFundingFlow(null)}
          className="w-6 h-6 rounded flex items-center justify-center cursor-pointer"
          style={{ color: 'var(--probex-text-muted)' }}
          aria-label="Close withdrawal panel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
      )}

      <div className="p-4 flex flex-col gap-4">

        {/* Available balance banner */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border)' }}>
          <span className="text-xs" style={{ color: 'var(--probex-text-muted)' }}>Available to withdraw</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--probex-positive)' }}>{formatCurrency(available)}</span>
        </div>

        {/* Destination selector */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="withdrawal-destination" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>Destination</label>
          <select
            id="withdrawal-destination"
            value={selectedMethodId ?? ''}
            onChange={(e) => setFundingMethod(e.target.value as typeof selectedMethodId)}
            className="input-base h-10 text-sm"
            aria-label="Select withdrawal destination"
          >
            <option value="" disabled>Select a destination…</option>
            {getFundingMethodsByCategory('crypto').map((m) => (
              <option key={m.id} value={m.id}>{m.name}{connection ? ` · ${formatAddress(connection.address)}` : ''}</option>
            ))}
            {getFundingMethodsByCategory('fiat').map((m) => (
              <option key={m.id} value={m.id}>{m.name} · {m.feeLabel}</option>
            ))}
          </select>
        </div>

        {/* Amount input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="withdrawal-amount" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none" style={{ color: 'var(--probex-text-secondary)' }} aria-hidden="true">$</span>
            <input
              id="withdrawal-amount"
              type="text"
              inputMode="decimal"
              value={withdrawalAmount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, '')
                if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) setWithdrawalAmount(v)
              }}
              placeholder="0.00"
              className="w-full h-11 pl-7 pr-4 rounded-lg text-base font-semibold tabular-nums outline-none transition-colors duration-150"
              style={{
                background: 'var(--probex-surface-2)',
                border:     `1px solid ${exceedsBalance ? 'var(--probex-negative)' : amount > 0 ? 'var(--probex-border-active)' : 'var(--probex-border-default)'}`,
                color:      'var(--probex-text-primary)',
              }}
            />
          </div>

          {/* Quick percent buttons */}
          <div className="flex gap-1.5">
            {QUICK_PCTS.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setWithdrawalAmount(((available * pct) / 100).toFixed(2))}
                className="flex-1 text-xs font-semibold py-1.5 rounded-md cursor-pointer transition-all duration-100"
                style={{ background: 'var(--probex-surface-2)', color: 'var(--probex-text-muted)', border: '1px solid var(--probex-border)' }}
              >
                {pct === 100 ? 'Max' : `${pct}%`}
              </button>
            ))}
          </div>

          {exceedsBalance && (
            <p className="text-2xs font-medium" style={{ color: 'var(--probex-negative)' }} role="alert">
              Amount exceeds available balance of {formatCurrency(available)}
            </p>
          )}
        </div>

        {/* Review summary */}
        {method && amount > 0 && !exceedsBalance && (
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--probex-border)' }}>
            <SummaryRow label="Withdrawal Amount" value={formatCurrency(amount)} />
            <SummaryRow label="Fee" value={feeAmount > 0 ? formatCurrency(feeAmount) : method.feeLabel} muted />
            <SummaryRow label="You'll Receive" value={formatCurrency(netAmount)} bold valueColor="var(--probex-positive)" />
            <SummaryRow label="Processing Time" value={method.settlementTime} muted />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="btn-primary h-11 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? 'Processing…' : !method ? 'Select a destination' : exceedsBalance ? 'Insufficient balance' : amount <= 0 ? 'Enter an amount' : `Withdraw ${formatCurrency(amount)}`}
        </button>

        <p className="text-2xs text-center" style={{ color: 'var(--probex-text-disabled)' }}>
          Demo only — no funds are transferred in this build.
        </p>
      </div>
    </div>
  )
}
