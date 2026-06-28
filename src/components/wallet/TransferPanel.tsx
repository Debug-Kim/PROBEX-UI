'use client'

import { useState }              from 'react'
import { cn, formatCurrency }    from '@/lib/utils'
import { getMockWalletBalance }  from '@/mock/wallet'
import { useWalletStore }        from '@/store/walletStore'
import { SummaryRow, Spinner }   from './DepositPanel'
import type { CSSProperties } from 'react'

/**
 * TransferPanel
 * ─────────────
 * Internal transfer flow — e.g. moving funds between "Available Balance"
 * and "Trading Capital" sub-accounts, or to another Probex username.
 *
 * This is intentionally simple: Probex operates a single USDC balance,
 * so "transfer" here models account-to-account transfers within the
 * platform (future multi-account / sub-account support).
 *
 * Mock actions only.
 */
export function TransferPanel({ className, hideHeader = false, style }: { className?: string; hideHeader?: boolean; style?: CSSProperties }) {
  const { transferAmount, transferDestination, setTransferAmount, setTransferDestination, setFundingFlow, resetFundingInputs } = useWalletStore()
  const [submitted, setSubmitted]       = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const balance   = getMockWalletBalance()
  const amount    = parseFloat(transferAmount) || 0
  const available = balance.usdcBalance

  const exceedsBalance = amount > available
  const hasDestination = transferDestination.trim().length >= 3
  const isValid = amount > 0 && !exceedsBalance && hasDestination

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1000))
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
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--probex-primary-dim)', border: '1px solid var(--probex-yes-border)' }} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--probex-primary)' }}>
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--probex-text-primary)' }}>Transfer complete</p>
          <p className="text-xs mt-1" style={{ color: 'var(--probex-text-muted)' }}>
            {formatCurrency(amount)} sent to {transferDestination}
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
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>Internal Transfer</h2>
        <button
          onClick={() => setFundingFlow(null)}
          className="w-6 h-6 rounded flex items-center justify-center cursor-pointer"
          style={{ color: 'var(--probex-text-muted)' }}
          aria-label="Close transfer panel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
      )}

      <div className="p-4 flex flex-col gap-4">

        {/* Source (fixed) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>From</label>
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--probex-text-primary)' }}>Probex Available Balance</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--probex-positive)' }}>{formatCurrency(available)}</span>
          </div>
        </div>

        {/* Destination */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="transfer-destination" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>To</label>
          <input
            id="transfer-destination"
            type="text"
            value={transferDestination}
            onChange={(e) => setTransferDestination(e.target.value)}
            placeholder="Probex username, email, or wallet address"
            className="input-base h-10 text-sm"
          />
          <p className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
            Transfers to other Probex accounts settle instantly with no fee.
          </p>
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-2">
          <label htmlFor="transfer-amount" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none" style={{ color: 'var(--probex-text-secondary)' }} aria-hidden="true">$</span>
            <input
              id="transfer-amount"
              type="text"
              inputMode="decimal"
              value={transferAmount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, '')
                if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) setTransferAmount(v)
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
          {exceedsBalance && (
            <p className="text-2xs font-medium" style={{ color: 'var(--probex-negative)' }} role="alert">
              Amount exceeds available balance of {formatCurrency(available)}
            </p>
          )}
        </div>

        {/* Summary */}
        {amount > 0 && !exceedsBalance && hasDestination && (
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--probex-border)' }}>
            <SummaryRow label="Transfer Amount" value={formatCurrency(amount)} />
            <SummaryRow label="Fee" value="No fee" muted />
            <SummaryRow label="Recipient" value={transferDestination} muted />
            <SummaryRow label="Settlement" value="Instant" bold valueColor="var(--probex-positive)" />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="btn-primary h-11 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? 'Transferring…' : exceedsBalance ? 'Insufficient balance' : !hasDestination ? 'Enter a recipient' : amount <= 0 ? 'Enter an amount' : `Transfer ${formatCurrency(amount)}`}
        </button>

        <p className="text-2xs text-center" style={{ color: 'var(--probex-text-disabled)' }}>
          Demo only — no funds are moved in this build.
        </p>
      </div>
    </div>
  )
}
