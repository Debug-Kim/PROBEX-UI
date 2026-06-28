'use client'

import { cn, formatCurrency } from '@/lib/utils'
import { StatCard }           from '@/components/ui/StatCard'
import { StatCardSkeleton }   from '@/components/ui/LoadingState'
import { getMockWalletBalance, MOCK_PENDING_FUNDS, MOCK_FUNDING_STATUS, FUNDING_STATUS_LABELS, FUNDING_STATUS_COLORS } from '@/mock/wallet'

interface WalletOverviewProps {
  className?: string
  isLoading?: boolean
}

/**
 * WalletOverview
 * ──────────────
 * Five-stat grid summarizing wallet headline numbers:
 * Total Balance, Available Balance, Pending Deposits,
 * Pending Withdrawals, Funding Status.
 *
 * Mirrors the visual pattern of PortfolioMetrics for consistency
 * across the two financial workflows.
 */
export function WalletOverview({ className, isLoading }: WalletOverviewProps) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3', className)}>
        {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  const balance = getMockWalletBalance()
  const pending = MOCK_PENDING_FUNDS

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3', className)}>

      <StatCard
        label="Total Balance"
        value={formatCurrency(balance.totalValue)}
        deltaLabel="USDC + positions"
      />

      <StatCard
        label="Available Balance"
        value={formatCurrency(balance.usdcBalance)}
        valueColor="var(--probex-positive)"
        deltaLabel="Ready to deploy"
      />

      <StatCard
        label="Pending Deposits"
        value={formatCurrency(pending.pendingDeposits)}
        valueColor={pending.pendingDeposits > 0 ? 'var(--probex-warning)' : undefined}
        deltaLabel={`${pending.depositCount} in progress`}
      />

      <StatCard
        label="Pending Withdrawals"
        value={formatCurrency(pending.pendingWithdrawals)}
        valueColor={pending.pendingWithdrawals > 0 ? 'var(--probex-warning)' : undefined}
        deltaLabel={`${pending.withdrawalCount} in progress`}
      />

      <StatCard
        label="Funding Status"
        value={FUNDING_STATUS_LABELS[MOCK_FUNDING_STATUS]}
        valueColor={FUNDING_STATUS_COLORS[MOCK_FUNDING_STATUS]}
        deltaLabel="KYC verified"
      />

    </div>
  )
}
