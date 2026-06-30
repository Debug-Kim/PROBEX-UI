'use client'

import { cn, formatCurrency }                         from '@/lib/utils'
import { StatCard }                                    from '@/components/ui/StatCard'
import { StatCardSkeleton }                            from '@/components/ui/LoadingState'
import { useWalletBalance, useWalletPendingFunds }     from '@/hooks/useServices'
import type { FundingStatus }                          from '@/types/wallet'

const FUNDING_STATUS_LABELS: Record<FundingStatus, string> = {
  active:                 'Active',
  'pending-verification': 'Pending Verification',
  restricted:             'Restricted',
}

const FUNDING_STATUS_COLORS: Record<FundingStatus, string> = {
  active:                 'var(--probex-positive)',
  'pending-verification': 'var(--probex-warning)',
  restricted:             'var(--probex-negative)',
}

interface WalletOverviewProps {
  className?: string
  isLoading?: boolean
}

export function WalletOverview({ className, isLoading }: WalletOverviewProps) {
  const balance = useWalletBalance().data
  const pending = useWalletPendingFunds().data

  if (isLoading || !balance || !pending) {
    return (
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3', className)}>
        {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  const fundingStatus: FundingStatus = 'active'

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
        value={FUNDING_STATUS_LABELS[fundingStatus]}
        valueColor={FUNDING_STATUS_COLORS[fundingStatus]}
        deltaLabel="KYC verified"
      />

    </div>
  )
}
