'use client'

import {useMemo}           from 'react'
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, } from 'recharts'
import {cn}    from '@/lib/utils'
import {generatePriceHistory} from '@/mock/marketHistory'
import {useActiveTimeframe}  from '@/store/marketStore'
import type { TimeRange }      from '@/types/market'

interface ProbabilityChartProps {
  marketId:    string
  probability: number
  className?:  string
  height?:     number
}

/**
 * ProbabilityChart
 * ─────────────────
 * Recharts AreaChart showing probability over time.
 * Probability is the secondary signal — the ConsensusHistory chart
 * should always appear above or alongside this.
 *
 * replace generatePriceHistory with IMarketService.getMarketHistory.
 */
export function ProbabilityChart({
  marketId,
  probability,
  className,
  height = 180,
}: ProbabilityChartProps) {
  const timeframe = useActiveTimeframe()

  const data = useMemo(
    () => generatePriceHistory(marketId, probability, timeframe).map((p) => ({
      ts:    p.timestamp,
      prob:  Math.round(p.probability * 100),
      label: formatAxisLabel(p.timestamp, timeframe),
    })),
    [marketId, probability, timeframe],
  )

  const current = Math.round(probability * 100)

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--probex-yes)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--probex-yes)" stopOpacity={0}   />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--probex-chart-grid)"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'var(--probex-text-disabled)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'var(--probex-text-disabled)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}%`}
            width={36}
          />

          <Tooltip content={<ProbTooltip />} />

          <ReferenceLine
            y={current}
            stroke="var(--probex-yes)"
            strokeDasharray="4 3"
            strokeOpacity={0.4}
          />

          <Area
            type="monotone"
            dataKey="prob"
            stroke="var(--probex-yes)"
            strokeWidth={1.5}
            fill="url(#probGrad)"
            dot={false}
            activeDot={{ r: 3, fill: 'var(--probex-yes)', stroke: 'var(--probex-bg)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────

function ProbTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-2.5 py-1.5 rounded-md text-xs"
      style={{
        background: 'var(--probex-surface-2)',
        border:     '1px solid var(--probex-border-default)',
        color:      'var(--probex-text-primary)',
      }}
    >
      <span style={{ color: 'var(--probex-text-muted)' }}>{label} · </span>
      <span className="font-semibold" style={{ color: 'var(--probex-yes)' }}>
        {payload[0]?.value ?? 0}%
      </span>
    </div>
  )
}

// ─── Axis label formatter ─────────────────────────────────────────────────

function formatAxisLabel(ts: number, range: TimeRange): string {
  const d = new Date(ts)
  switch (range) {
    case '1h':
    case '24h': return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    case '7d':  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    default:    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}
