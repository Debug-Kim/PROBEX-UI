'use client'

import { useMemo }              from 'react'
import { cn, formatCurrency }   from '@/lib/utils'
import { useTransactions }       from '@/hooks/useServices'
import { Skeleton }              from '@/components/ui/LoadingState'

/**
 * WalletInsights
 * ───────────────
 * Institutional-style funding summary panel.
 *
 * Metrics:
 *   - Largest Deposit / Withdrawal
 *   - Average Account Balance (approximated from deposit/withdrawal/settlement flow)
 *   - Funding Velocity (net inflow over the observed period, $/day)
 *   - Settlement Activity (win/loss settlement count and net P&L)
 *   - Funding Source Distribution (deposit method breakdown — mocked
 *     since all mock deposits are USDC/Polygon)
 */
export function WalletInsights({ className, isLoading }: { className?: string; isLoading?: boolean }) {
  const transactions = useTransactions().data ?? []

  const metrics = useMemo(() => {
    const deposits     = transactions.filter((t) => t.type === 'deposit' && t.status === 'confirmed')
    const withdrawals  = transactions.filter((t) => t.type === 'withdrawal' && t.status !== 'failed')
    const settlements  = transactions.filter((t) => t.type === 'settlement-win' || t.type === 'settlement-loss')

    const largestDeposit    = deposits.length    ? Math.max(...deposits.map((t) => t.amount)) : 0
    const largestWithdrawal = withdrawals.length ? Math.max(...withdrawals.map((t) => Math.abs(t.amount))) : 0

    const totalDeposits    = deposits.reduce((s, t) => s + t.amount, 0)
    const totalWithdrawals = withdrawals.reduce((s, t) => s + Math.abs(t.amount), 0)
    const netInflow        = totalDeposits - totalWithdrawals

    const timestamps = transactions.map((t) => new Date(t.createdAt).getTime())
    const spanDays   = timestamps.length >= 2 ? Math.max(1, (Math.max(...timestamps) - Math.min(...timestamps)) / 86_400_000) : 1
    const velocity   = netInflow / spanDays

    const settlementPnl = settlements.reduce((s, t) => s + t.amount, 0)
    const avgBalance    = totalDeposits - totalWithdrawals / 2 + settlementPnl / 2

    const wins   = settlements.filter((t) => t.type === 'settlement-win')
    const losses = settlements.filter((t) => t.type === 'settlement-loss')

    return {
      largestDeposit, largestWithdrawal, avgBalance, velocity,
      settlementCount: settlements.length, settlementPnl,
      winCount: wins.length, lossCount: losses.length,
    }
  }, [transactions])

  // Funding source distribution — all mock deposits are USDC/Polygon
  const sources = [
    { label: 'USDC on Polygon', pct: 0.83, colorVar: 'var(--probex-primary)' },
    { label: 'Bank Transfer',    pct: 0.12, colorVar: 'var(--probex-positive)' },
    { label: 'PayPal',           pct: 0.05, colorVar: 'var(--probex-warning)' },
  ]

  if (isLoading) {
    return (
      <div className={cn('rounded-xl p-4 flex flex-col gap-3', className)} style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
        <Skeleton height={12} width={100} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={72} rounded />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Skeleton height={80} rounded />
          <Skeleton height={80} rounded />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl overflow-hidden', className)} style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>

      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>
          Wallet Insights
        </h2>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* Metric grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricBlock label="Largest Deposit"    value={formatCurrency(metrics.largestDeposit)}    color="var(--probex-positive)" />
          <MetricBlock label="Largest Withdrawal" value={formatCurrency(metrics.largestWithdrawal)} color="var(--probex-warning)" />
          <MetricBlock label="Avg. Balance"       value={formatCurrency(metrics.avgBalance)}        color="var(--probex-text-primary)" />
          <MetricBlock
            label="Funding Velocity"
            value={`${metrics.velocity >= 0 ? '+' : ''}${formatCurrency(metrics.velocity)}/day`}
            color={metrics.velocity >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)'}
          />
        </div>

        {/* Settlement activity + funding sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

          {/* Settlement activity */}
          <div className="flex flex-col gap-2 p-3 rounded-lg" style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border)' }}>
            <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>Settlement Activity</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--probex-positive-dim)', color: 'var(--probex-positive)' }}>
                  {metrics.winCount}W
                </span>
                <span className="font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--probex-negative-dim)', color: 'var(--probex-negative)' }}>
                  {metrics.lossCount}L
                </span>
                <span style={{ color: 'var(--probex-text-muted)' }}>· {metrics.settlementCount} settled</span>
              </div>
              <span className="text-sm font-bold tabular-nums" style={{ color: metrics.settlementPnl >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)' }}>
                {metrics.settlementPnl >= 0 ? '+' : ''}{formatCurrency(metrics.settlementPnl)}
              </span>
            </div>
          </div>

          {/* Funding source distribution */}
          <div className="flex flex-col gap-2 p-3 rounded-lg" style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border)' }}>
            <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>Funding Source Distribution</span>
            <div className="flex flex-col gap-1.5">
              {sources.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-2xs flex-1" style={{ color: 'var(--probex-text-secondary)' }}>{s.label}</span>
                  <div className="h-1.5 rounded-full overflow-hidden w-20" style={{ background: 'var(--probex-border-default)' }}>
                    <div className="h-full rounded-full" style={{ width: `${s.pct * 100}%`, background: s.colorVar }} />
                  </div>
                  <span className="text-2xs font-semibold tabular-nums w-10 text-right" style={{ color: s.colorVar }}>
                    {Math.round(s.pct * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

// ─── Metric Block ──────────────────────────────────────────────────────────

function MetricBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg" style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border)' }}>
      <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>{label}</span>
      <span className="text-xl font-black tabular-nums" style={{ color }}>{value}</span>
    </div>
  )
}
