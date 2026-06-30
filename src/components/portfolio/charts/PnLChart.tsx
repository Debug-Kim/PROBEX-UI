'use client'

import { useMemo }                 from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { cn, formatCurrency, formatCompact } from '@/lib/utils'
import { usePortfolioPerformance }           from '@/hooks/useServices'
import { useChartTimeframe }                 from '@/store/portfolioStore'

interface PnLChartProps {
  className?: string
  height?:    number
}

const DAYS_MAP: Record<string, number> = {
  '1h': 1, '24h': 3, '7d': 7, '30d': 30, '90d': 90, 'all': 365,
}

/**
 * PnLChart
 * ────────
 * Composed chart: daily P&L bars (green/red) + cumulative P&L line.
 * Gives immediate visual sense of win/loss streaks and trend.
 */
export function PnLChart({ className, height = 180 }: PnLChartProps) {
  const timeframe = useChartTimeframe()
  const days      = DAYS_MAP[timeframe] ?? 30
  const pts       = usePortfolioPerformance(days).data ?? []

  const data = useMemo(() => {
    const step = Math.max(1, Math.floor(pts.length / 50))
    return pts.filter((_, i) => i % step === 0).map((p) => ({
      ts:      p.timestamp,
      daily:   Math.round(p.dailyPnl),
      cumPnl:  Math.round(p.cumulativePnl),
      label:   new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
  }, [pts])

  const cumFinal = data.at(-1)?.cumPnl ?? 0
  const cumColor = cumFinal >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)'

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--probex-chart-grid)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--probex-text-disabled)' }}
            tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={(v: number) => `$${formatCompact(Math.abs(v))}${v < 0 ? '-' : ''}`}
            tick={{ fontSize: 10, fill: 'var(--probex-text-disabled)' }}
            tickLine={false} axisLine={false} width={42} />
          <Tooltip content={<PnLTooltip />} />
          <ReferenceLine y={0} stroke="var(--probex-border-default)" strokeDasharray="4 2" />

          {/* Daily bars — green positive, red negative */}
          <Bar dataKey="daily" name="Daily P&L" barSize={4} radius={[2, 2, 0, 0]}
            fill="var(--probex-positive)"
            // Override color per bar value
            label={false}
          />

          {/* Cumulative line */}
          <Line type="monotone" dataKey="cumPnl" name="Cumulative P&L"
            stroke={cumColor} strokeWidth={2} dot={false}
            activeDot={{ r: 3, fill: cumColor, stroke: 'var(--probex-bg)', strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function PnLTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-md text-xs flex flex-col gap-1"
      style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)' }}>
      <span style={{ color: 'var(--probex-text-muted)' }}>{label}</span>
      {payload.map((p) => {
        const color = p.name === 'Daily P&L'
          ? (p.value >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)')
          : (p.value >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)')
        return (
          <div key={p.name} className="flex gap-2 items-center">
            <span style={{ color: 'var(--probex-text-secondary)' }}>{p.name}</span>
            <span className="font-semibold ml-auto" style={{ color }}>
              {p.value >= 0 ? '+' : ''}{formatCurrency(p.value)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
