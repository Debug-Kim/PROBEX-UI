'use client'

import { useMemo }            from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn, formatCompact }   from '@/lib/utils'
import { useVolumeHistory }    from '@/hooks/useServices'
import { useActiveTimeframe }  from '@/store/marketStore'
import type { TimeRange }      from '@/types/market'

interface VolumeChartProps {
  marketId:   string
  className?: string
  height?:    number
}

export function VolumeChart({
  marketId,
  className,
  height = 120,
}: VolumeChartProps) {
  const timeframe = useActiveTimeframe()
  const { data: volumePoints } = useVolumeHistory(marketId, timeframe)

  const data = useMemo(
    () => (volumePoints ?? []).map((p) => ({
      ts:    p.ts,
      yes:   Math.round(p.yesVol),
      no:    Math.round(p.noVol),
      label: formatAxisLabel(p.ts, timeframe),
    })),
    [volumePoints, timeframe],
  )

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 2, right: 4, bottom: 0, left: -16 }} barSize={3} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--probex-chart-grid)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: 'var(--probex-text-disabled)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'var(--probex-text-disabled)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatCompact(v)}
            width={34}
          />
          <Tooltip content={<VolumeTooltip />} />
          <Bar dataKey="yes" name="YES" stackId="a" fill="var(--probex-yes)"    fillOpacity={0.75} radius={[0, 0, 0, 0]} />
          <Bar dataKey="no"  name="NO"  stackId="a" fill="var(--probex-no)"     fillOpacity={0.65} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function VolumeTooltip({ active, payload, label }: {
  active?:  boolean
  payload?: Array<{ value: number; name: string; fill: string }>
  label?:   string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)
  return (
    <div
      className="px-2.5 py-1.5 rounded-md text-xs flex flex-col gap-1"
      style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)' }}
    >
      <span style={{ color: 'var(--probex-text-muted)' }}>{label}</span>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
          <span style={{ color: 'var(--probex-text-secondary)' }}>{p.name}</span>
          <span className="font-semibold ml-auto" style={{ color: p.fill }}>${formatCompact(p.value)}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 border-t pt-1" style={{ borderColor: 'var(--probex-border)' }}>
        <span style={{ color: 'var(--probex-text-muted)' }}>Total</span>
        <span className="font-bold ml-auto" style={{ color: 'var(--probex-text-primary)' }}>${formatCompact(total)}</span>
      </div>
    </div>
  )
}

function formatAxisLabel(ts: number, range: TimeRange): string {
  const d = new Date(ts)
  switch (range) {
    case '1h':
    case '24h': return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    default:    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}
