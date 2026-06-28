'use client'

import { useMemo }            from 'react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { cn }                 from '@/lib/utils'
import { generateWinRateHistory } from '@/mock/performance'

interface WinRateChartProps {
  className?: string
  height?:    number
}

/**
 * WinRateChart
 * ────────────
 * Line chart of rolling win rate over time, with a 50% reference line.
 * Bars in the background show cumulative bet volume (secondary axis).
 */
export function WinRateChart({ className, height = 180 }: WinRateChartProps) {
  const data = useMemo(() => {
    return generateWinRateHistory().map((p) => ({
      ts:       p.timestamp,
      winRate:  Math.round(p.winRate * 1000) / 10,  // percentage with 1 decimal
      bets:     p.totalBets,
      label:    new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
  }, [])

  const latest = data.at(-1)?.winRate ?? 0
  const color  = latest >= 55 ? 'var(--probex-positive)' : latest >= 45 ? 'var(--probex-warning)' : 'var(--probex-negative)'

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--probex-chart-grid)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--probex-text-disabled)' }}
            tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis yAxisId="rate" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 10, fill: 'var(--probex-text-disabled)' }}
            tickLine={false} axisLine={false} width={36} />
          <YAxis yAxisId="bets" orientation="right" hide />
          <Tooltip content={<WinRateTooltip />} />

          <ReferenceLine yAxisId="rate" y={50} stroke="var(--probex-border-default)" strokeDasharray="4 2" />

          <Bar yAxisId="bets" dataKey="bets" name="Total Bets" barSize={3}
            fill="var(--probex-primary)" fillOpacity={0.12} radius={[1, 1, 0, 0]} />

          <Line yAxisId="rate" type="monotone" dataKey="winRate" name="Win Rate"
            stroke={color} strokeWidth={2} dot={false}
            activeDot={{ r: 3, fill: color, stroke: 'var(--probex-bg)', strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function WinRateTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-md text-xs flex flex-col gap-1"
      style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)' }}>
      <span style={{ color: 'var(--probex-text-muted)' }}>{label}</span>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: 'var(--probex-text-secondary)' }}>{p.name}</span>
          <span className="font-semibold ml-auto" style={{ color: 'var(--probex-text-primary)' }}>
            {p.name === 'Win Rate' ? `${p.value}%` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}
