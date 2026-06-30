'use client'

import { useState }             from 'react'
import { cn, formatCurrency }  from '@/lib/utils'
import { getFundingMethod, FUNDING_METHODS } from '@/lib/wallet/fundingMethods'

import {useWalletStore, useSelectedFundingMethod} from '@/store/walletStore'
import type { CSSProperties } from 'react'

const QUICK_AMOUNTS = [100, 500, 1000, 5000] as const

/**
 * DepositPanel
 * ────────────
 * Deposit flow: select funding source → enter amount → review summary.
 * All actions are mocked — no real funds move.
 */
export function DepositPanel({ className, hideHeader = false, style }: { className?: string; hideHeader?: boolean; style?: CSSProperties }) {
  const selectedMethodId = useSelectedFundingMethod()
  const { depositAmount, setDepositAmount, setFundingMethod, setFundingFlow, resetFundingInputs } = useWalletStore()
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const method = selectedMethodId ? getFundingMethod(selectedMethodId) : undefined
  const amount = parseFloat(depositAmount) || 0

  const feeAmount = method?.feeLabel.includes('%')
    ? amount * (parseFloat(method.feeLabel) / 100)
    : 0
  const netAmount = amount - feeAmount

  const isValid = method && amount >= method.minAmount && amount <= method.maxAmount

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
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--probex-positive-dim)', border: '1px solid rgba(16,185,129,0.2)' }} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--probex-positive)' }}>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--probex-text-primary)' }}>Deposit initiated</p>
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
      {/* Header — hidden when rendered inside FundingHub (tabs provide navigation) */}
      {!hideHeader && (
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>Deposit Funds</h2>
        <button
          onClick={() => setFundingFlow(null)}
          className="w-6 h-6 rounded flex items-center justify-center cursor-pointer"
          style={{ color: 'var(--probex-text-muted)' }}
          aria-label="Close deposit panel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
      )}

      <div className="p-4 flex flex-col gap-4">
        {/* Method selector */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="deposit-source" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>Funding Source</label>
          <select
            id="deposit-source"
            value={selectedMethodId ?? ''}
            onChange={(e) => setFundingMethod(e.target.value as typeof selectedMethodId)}
            className="input-base h-10 text-sm"
            aria-label="Select funding source"
          >
            <option value="" disabled>Select a funding method…</option>
            {FUNDING_METHODS.map((m) => (
              <option key={m.id} value={m.id}>{m.name} · {m.feeLabel}</option>
            ))}
          </select>
        </div>

        {/* Amount input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="deposit-amount" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none" style={{ color: 'var(--probex-text-secondary)' }} aria-hidden="true">$</span>
            <input
              id="deposit-amount"
              type="text"
              inputMode="decimal"
              value={depositAmount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, '')
                if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) setDepositAmount(v)
              }}
              placeholder="0.00"
              className="w-full h-11 pl-7 pr-4 rounded-lg text-base font-semibold tabular-nums outline-none transition-colors duration-150"
              style={{ background: 'var(--probex-surface-2)', border: `1px solid ${amount > 0 ? 'var(--probex-border-active)' : 'var(--probex-border-default)'}`, color: 'var(--probex-text-primary)' }}
            />
          </div>
          <div className="flex gap-1.5">
            {QUICK_AMOUNTS.map((amt) => (
              <button key={amt} type="button" onClick={() => setDepositAmount(String(amt))}
                className="flex-1 text-xs font-semibold py-1.5 rounded-md cursor-pointer transition-all duration-100"
                style={amount === amt ? { background: 'var(--probex-primary-dim)', color: 'var(--probex-primary)', border: '1px solid var(--probex-yes-border)' } : { background: 'var(--probex-surface-2)', color: 'var(--probex-text-muted)', border: '1px solid var(--probex-border)' }}>
                ${amt.toLocaleString()}
              </button>
            ))}
          </div>
          {method && (
            <p className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
              Min {formatCurrency(method.minAmount)} · Max {formatCurrency(method.maxAmount)}
            </p>
          )}
        </div>

        {/* Review summary */}
        {method && amount > 0 && (
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--probex-border)' }}>
            <SummaryRow label="Deposit Amount" value={formatCurrency(amount)} />
            <SummaryRow label="Fee" value={feeAmount > 0 ? formatCurrency(feeAmount) : method.feeLabel} muted />
            <SummaryRow label="You'll Receive" value={formatCurrency(netAmount)} bold valueColor="var(--probex-positive)" />
            <SummaryRow label="Settlement Time" value={method.settlementTime} muted />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="btn-primary h-11 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? 'Processing…' : !method ? 'Select a method' : !isValid ? `Min ${formatCurrency(method.minAmount)}` : `Deposit ${formatCurrency(amount)}`}
        </button>

        <p className="text-2xs text-center" style={{ color: 'var(--probex-text-disabled)' }}>
          Demo only — no funds are transferred in this build.
        </p>
      </div>
    </div>
  )
}

// ─── Shared summary row ───────────────────────────────────────────────────

export function SummaryRow({
  label, value, bold, muted, valueColor,
}: { label: string; value: string; bold?: boolean; muted?: boolean; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid var(--probex-border)' }}>
      <span className="text-xs" style={{ color: 'var(--probex-text-muted)' }}>{label}</span>
      <span className={cn('text-xs tabular-nums', bold && 'font-semibold')} style={{ color: muted ? 'var(--probex-text-disabled)' : (valueColor ?? 'var(--probex-text-primary)') }}>
        {value}
      </span>
    </div>
  )
}

export function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
