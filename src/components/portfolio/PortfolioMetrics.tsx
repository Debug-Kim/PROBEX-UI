'use client'

import { cn, formatCurrency } from '@/lib/utils'
import { StatCard }           from '@/components/ui/StatCard'
import { usePortfolioSummary } from '@/hooks/useServices'

interface PortfolioMetricsProps {
  className?: string
}

export function PortfolioMetrics({ className }: PortfolioMetricsProps) {
  const summary = usePortfolioSummary().data
  if (!summary) return null

  const isProfit = summary.unrealizedPnl >= 0
  const isRealizedProfit = summary.realizedPnl >= 0

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3', className)}>

      <StatCard
        label="Portfolio Value"
        value={formatCurrency(summary.currentValue)}
        deltaLabel={`${summary.openPositionCount} open positions`}
      />

      <StatCard
        label="Unrealized P&L"
        value={`${isProfit ? '+' : ''}${formatCurrency(summary.unrealizedPnl)}`}
        valueColor={isProfit ? 'var(--probex-positive)' : 'var(--probex-negative)'}
        delta={summary.unrealizedPnlPct}
      />

      <StatCard
        label="Realized P&L"
        value={`${isRealizedProfit ? '+' : ''}${formatCurrency(summary.realizedPnl)}`}
        valueColor={isRealizedProfit ? 'var(--probex-positive)' : 'var(--probex-negative)'}
        deltaLabel={`${summary.settledPositionCount} settled`}
      />

      <StatCard
        label="Win Rate"
        value={`${Math.round(summary.winRate * 100)}%`}
        valueColor={summary.winRate >= 0.5 ? 'var(--probex-positive)' : 'var(--probex-warning)'}
        deltaLabel={`${summary.winCount}W / ${summary.lossCount}L`}
      />

      <StatCard
        label="Avg. Consensus"
        value={`${Math.round(summary.avgConsensusScore * 100)}%`}
        valueColor="var(--probex-primary)"
        deltaLabel="Open positions"
      />

      <StatCard
        label="Total Deployed"
        value={formatCurrency(summary.totalDeployed)}
        deltaLabel="All-time capital"
      />

    </div>
  )
}
