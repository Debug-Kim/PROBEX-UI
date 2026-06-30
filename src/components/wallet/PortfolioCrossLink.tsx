'use client'

import Link                       from 'next/link'
import { cn, formatCurrency }     from '@/lib/utils'
import { usePortfolioSummary, useWalletBalance } from '@/hooks/useServices'
import { ROUTES }                 from '@/config/constants'

/**
 * PortfolioCrossLink
 * ────────────────────
 * Subtle integration row linking the Wallet to the Portfolio module
 * without duplicating Portfolio screens.
 *
 * Shows:
 *   - Portfolio Value (links to /dashboard/portfolio)
 *   - Available Trading Capital (the USDC balance available to deploy)
 *   - Recent Settlement Activity (links to Portfolio settled positions)
 */
export function PortfolioCrossLink({ className }: { className?: string }) {
  const portfolio = usePortfolioSummary().data
  const balance   = useWalletBalance().data

  if (!portfolio || !balance) return null

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-3', className)}>

      <Link
        href={ROUTES.PORTFOLIO}
        className="flex flex-col gap-1 p-3 rounded-lg cursor-pointer transition-colors duration-100 no-underline"
        style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--probex-border-active)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--probex-border)' }}
      >
        <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>Portfolio Value</span>
        <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--probex-primary)' }}>{formatCurrency(portfolio.currentValue)}</span>
        <span className="text-2xs flex items-center gap-1" style={{ color: 'var(--probex-text-disabled)' }}>
          {portfolio.openPositionCount} open positions
          <ArrowIcon />
        </span>
      </Link>

      <div className="flex flex-col gap-1 p-3 rounded-lg" style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
        <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>Available Trading Capital</span>
        <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--probex-positive)' }}>{formatCurrency(balance.usdcBalance)}</span>
        <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>Ready to deploy in markets</span>
      </div>

      <Link
        href={ROUTES.PORTFOLIO}
        className="flex flex-col gap-1 p-3 rounded-lg cursor-pointer transition-colors duration-100 no-underline"
        style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--probex-border-active)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--probex-border)' }}
      >
        <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>Realized P&amp;L</span>
        <span className="text-lg font-bold tabular-nums" style={{ color: portfolio.realizedPnl >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)' }}>
          {portfolio.realizedPnl >= 0 ? '+' : ''}{formatCurrency(portfolio.realizedPnl)}
        </span>
        <span className="text-2xs flex items-center gap-1" style={{ color: 'var(--probex-text-disabled)' }}>
          {portfolio.settledPositionCount} settled positions
          <ArrowIcon />
        </span>
      </Link>

    </div>
  )
}

function ArrowIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M7 7h10v10" /><path d="M7 17 17 7" />
    </svg>
  )
}
