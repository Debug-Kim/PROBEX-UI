'use client'

import { cn, formatCurrency }  from '@/lib/utils'
import { useWalletBalance }     from '@/hooks/useServices'
import { useHideSmallBalances } from '@/store/walletStore'
import { Skeleton } from '@/components/ui/LoadingState'

interface WalletBalanceCardProps {
  className?: string
  isLoading?: boolean
}

/**
 * WalletBalanceCard
 * ──────────────────
 * Large primary balance card showing total value with a breakdown
 * of available USDC, deployed (open positions), and POL gas balance.
 *
 * This is the visual anchor of the wallet page — analogous to the
 * ConsensusScoreCard on the market detail page.
 */
export function WalletBalanceCard({ className, isLoading }: WalletBalanceCardProps) {
  const hideSmall = useHideSmallBalances()
  const balance   = useWalletBalance().data

  if (isLoading || !balance) {
    return (
      <div className={cn('rounded-xl p-5 flex flex-col gap-4', className)}
        style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border-default)' }}>
        <Skeleton height={12} width={100} />
        <Skeleton height={36} width={160} />
        <Skeleton height={8} rounded />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={54} rounded />)}
        </div>
      </div>
    )
  }

  const usdcPct = balance.totalValue > 0 ? (balance.usdcBalance / balance.totalValue) * 100 : 0
  const portPct = 100 - usdcPct

  // POL balance — hidden if small balances are hidden and value is negligible
  const polUsdEstimate = balance.nativeBalance * 0.42  // mock POL price
  const showPol = !hideSmall || polUsdEstimate >= 1

  return (
    <div
      className={cn('rounded-xl p-5 flex flex-col gap-4', className)}
      style={{
        background: 'var(--probex-surface)',
        border:     '1px solid var(--probex-border-default)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>
          Total Balance
        </span>
        <span className="flex items-center gap-1.5 text-2xs" style={{ color: 'var(--probex-positive)' }}>
          <span className="live-dot w-1.5 h-1.5" aria-hidden="true" />
          Polygon
        </span>
      </div>

      {/* Total value */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black tabular-nums" style={{ color: 'var(--probex-text-primary)' }}>
          {formatCurrency(balance.totalValue)}
        </span>
        <span className="text-sm" style={{ color: 'var(--probex-text-muted)' }}>USD</span>
      </div>

      {/* Composition bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex h-2 rounded-full overflow-hidden" style={{ background: 'var(--probex-border-default)' }}>
          <div className="h-full" style={{ width: `${usdcPct}%`, background: 'var(--probex-positive)' }} />
          <div className="h-full" style={{ width: `${portPct}%`, background: 'var(--probex-primary)' }} />
        </div>
        <div className="flex items-center justify-between text-2xs">
          <span style={{ color: 'var(--probex-positive)' }}>
            Available {Math.round(usdcPct)}%
          </span>
          <span style={{ color: 'var(--probex-primary)' }}>
            Deployed {Math.round(portPct)}%
          </span>
        </div>
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <BalanceCell label="Available (USDC)" value={formatCurrency(balance.usdcBalance)} colorVar="var(--probex-positive)" />
        <BalanceCell label="In Positions" value={formatCurrency(balance.portfolioValue)} colorVar="var(--probex-primary)" />
        {showPol && (
          <BalanceCell
            label="Gas Balance"
            value={`${balance.nativeBalance.toFixed(3)} POL`}
            sublabel={`≈ ${formatCurrency(polUsdEstimate)}`}
          />
        )}
        <BalanceCell label="Network" value="Polygon" sublabel="Chain ID 137" />
      </div>
    </div>
  )
}

// ─── Balance Cell ─────────────────────────────────────────────────────────

function BalanceCell({
  label, value, sublabel, colorVar,
}: {
  label: string; value: string; sublabel?: string; colorVar?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 p-2.5 rounded-lg" style={{ background: 'var(--probex-surface-2)' }}>
      <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>{label}</span>
      <span className="text-sm font-bold tabular-nums" style={{ color: colorVar ?? 'var(--probex-text-primary)' }}>{value}</span>
      {sublabel && <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>{sublabel}</span>}
    </div>
  )
}
