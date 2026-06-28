'use client'

import { useMemo }            from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn, formatCurrency } from '@/lib/utils'
import { computeAllocationBySegment } from '@/mock/portfolio'

interface ExposureChartProps {
  className?: string
  height?:    number
}

/**
 * ExposureChart
 * ─────────────
 * Donut chart showing portfolio exposure by Bitcoin market segment.
 * Each slice is colored consistently with segment colors used elsewhere
 * (consensus-aware palette — green = institutional-favored segments).
 */
export function ExposureChart({ className, height = 220 }: ExposureChartProps) {
  const data = useMemo(() => computeAllocationBySegment(), [])
  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}
        style={{ height, color: 'var(--probex-text-muted)' }}>
        <p className="text-xs">No open positions</p>
      </div>
    )
  }

  return (
    <div className={cn('w-full flex flex-col', className)}>
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="85%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((slice) => (
                <Cell key={slice.segment} fill={slice.colorVar} />
              ))}
            </Pie>
            <Tooltip content={<ExposureTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>
            Total
          </span>
          <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--probex-text-primary)' }}>
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex flex-col gap-1.5 mt-2">
        {data.map((slice) => (
          <div key={slice.segment} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: slice.colorVar }} aria-hidden="true" />
            <span className="text-xs flex-1 truncate" style={{ color: 'var(--probex-text-secondary)' }}>
              {slice.label}
            </span>
            <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--probex-text-primary)' }}>
              {Math.round(slice.pct * 100)}%
            </span>
            <span
              className="text-2xs tabular-nums w-16 text-right"
              style={{ color: slice.pnl >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)' }}
            >
              {slice.pnl >= 0 ? '+' : ''}{formatCurrency(slice.pnl)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExposureTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ value: number; name: string; payload: { pct: number; count: number; colorVar: string } }>
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  if (!p) return null
  return (
    <div className="px-3 py-2 rounded-md text-xs flex flex-col gap-1"
      style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)' }}>
      <span className="font-semibold" style={{ color: 'var(--probex-text-primary)' }}>{p.name}</span>
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--probex-text-muted)' }}>Value</span>
        <span className="font-semibold ml-auto" style={{ color: p.payload.colorVar }}>{formatCurrency(p.value)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--probex-text-muted)' }}>Share</span>
        <span className="font-semibold ml-auto" style={{ color: 'var(--probex-text-secondary)' }}>{Math.round(p.payload.pct * 100)}%</span>
      </div>
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--probex-text-muted)' }}>Positions</span>
        <span className="font-semibold ml-auto" style={{ color: 'var(--probex-text-secondary)' }}>{p.payload.count}</span>
      </div>
    </div>
  )
}
