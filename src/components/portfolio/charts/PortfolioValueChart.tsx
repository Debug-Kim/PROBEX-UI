'use client'

import { useMemo }                                              from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn, formatCurrency, formatCompact }                   from '@/lib/utils'
import { usePortfolioPerformance }                             from '@/hooks/useServices'
import { useChartTimeframe }                                   from '@/store/portfolioStore'

interface PortfolioValueChartProps {
  className?: string
  height?:    number
}

const DAYS_MAP: Record<string, number> = {
  '1h': 1, '24h': 3, '7d': 7, '30d': 30, '90d': 90, 'all': 365,
}

/**
 * PortfolioValueChart
 * ───────────────────
 * Area chart showing total portfolio value and deployed capital over time.
 * Two series: total value (primary) and deployed (secondary fill).
 */
export function PortfolioValueChart({ className, height = 200 }: PortfolioValueChartProps) {
  const timeframe = useChartTimeframe()
  const days      = DAYS_MAP[timeframe] ?? 30
  const pts       = usePortfolioPerformance(days).data ?? []

  const data = useMemo(() => {
    const step = Math.max(1, Math.floor(pts.length / 60))  // max 60 points
    return pts.filter((_, i) => i % step === 0).map((p) => ({
      ts:       p.timestamp,
      total:    Math.round(p.portfolioValue),
      deployed: Math.round(p.deployedValue),
      cash:     Math.round(p.cashBalance),
      label:    formatAxisLabel(p.timestamp, days),
    }))
  }, [pts, days])

  const first = data[0]?.total ?? 10000
  const last  = data.at(-1)?.total ?? 10000
  const isUp  = last >= first

  const colorVar = isUp ? 'var(--probex-positive)' : 'var(--probex-negative)'

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="pvGradTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={colorVar} stopOpacity={0.2} />
              <stop offset="95%" stopColor={colorVar} stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="pvGradDeployed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--probex-primary)" stopOpacity={0.12} />
              <stop offset="95%" stopColor="var(--probex-primary)" stopOpacity={0}    />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--probex-chart-grid)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--probex-text-disabled)' }}
            tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={(v: number) => `$${formatCompact(v)}`}
            tick={{ fontSize: 10, fill: 'var(--probex-text-disabled)' }}
            tickLine={false} axisLine={false} width={42} />
          <Tooltip content={<PortfolioTooltip />} />

          <Area type="monotone" dataKey="deployed" name="Deployed"
            stroke="var(--probex-primary)" strokeWidth={1} fill="url(#pvGradDeployed)"
            dot={false} strokeDasharray="4 3" />

          <Area type="monotone" dataKey="total" name="Total Value"
            stroke={colorVar} strokeWidth={2} fill="url(#pvGradTotal)"
            dot={false}
            activeDot={{ r: 3, fill: colorVar, stroke: 'var(--probex-bg)', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function PortfolioTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?:   string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-md text-xs flex flex-col gap-1"
      style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)' }}>
      <span style={{ color: 'var(--probex-text-muted)' }}>{label}</span>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--probex-text-secondary)' }}>{p.name}</span>
          <span className="font-semibold ml-auto" style={{ color: p.color }}>
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

function formatAxisLabel(ts: number, days: number): string {
  const d = new Date(ts)
  if (days <= 7)  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (days <= 30) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}
