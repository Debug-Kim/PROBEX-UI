'use client'

import { useMemo }              from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { cn }                    from '@/lib/utils'
import { useConsensusBreakdownHistory } from '@/hooks/useServices'
import { useActiveTimeframe }           from '@/store/marketStore'
import type { TimeRange }               from '@/types/market'

interface ConsensusChartProps {
  marketId:       string
  className?:     string
  height?:        number
  showBreakdown?: boolean
}

/**
 * ConsensusChart
 * ──────────────
 * The PRIMARY chart on the market detail page.
 * Shows consensus score trend over time, with institutional vs retail breakdown.
 *
 * This chart should appear ABOVE the probability chart — it is the Probex
 * differentiation signal. Users should read the consensus trajectory before
 * they read the probability trajectory.
 *
 * replace with IConsensusService.getConsensusHistory.
 */
export function ConsensusChart({
  marketId,
  className,
  height        = 200,
  showBreakdown = true,
}: ConsensusChartProps) {
  const timeframe = useActiveTimeframe()
  const { data: breakdownPoints } = useConsensusBreakdownHistory(marketId, timeframe)

  const data = useMemo(
    () => (breakdownPoints ?? []).map((p) => ({
      ts:      p.ts,
      score:   Math.round(p.score * 100),
      inst:    Math.round(p.instScore * 100),
      retail:  Math.round(p.retailScore * 100),
      label:   formatAxisLabel(p.ts, timeframe),
    })),
    [breakdownPoints, timeframe],
  )

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
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

          <Tooltip content={<ConsensusTooltip showBreakdown={showBreakdown} />} />

          {showBreakdown && (
            <Legend
              formatter={(val: string) => (
                <span style={{ fontSize: 10, color: 'var(--probex-text-muted)' }}>
                  {val === 'inst' ? 'Institutional' : val === 'retail' ? 'Retail' : 'Overall'}
                </span>
              )}
            />
          )}

          {/* Overall consensus — thickest, primary */}
          <Line
            type="monotone"
            dataKey="score"
            name="score"
            stroke="var(--probex-primary)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: 'var(--probex-primary)', stroke: 'var(--probex-bg)', strokeWidth: 2 }}
          />

          {/* Institutional breakdown — dashed */}
          {showBreakdown && (
            <Line
              type="monotone"
              dataKey="inst"
              name="inst"
              stroke="var(--probex-positive)"
              strokeWidth={1.25}
              strokeDasharray="4 3"
              dot={false}
            />
          )}

          {/* Retail breakdown — dashed */}
          {showBreakdown && (
            <Line
              type="monotone"
              dataKey="retail"
              name="retail"
              stroke="var(--probex-warning)"
              strokeWidth={1.25}
              strokeDasharray="4 3"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────────

function ConsensusTooltip({
  active, payload, label, showBreakdown,
}: {
  active?:        boolean
  payload?:       Array<{ value: number; dataKey: string }>
  label?:         string
  showBreakdown?: boolean
}) {
  if (!active || !payload?.length) return null

  const get = (key: string) => payload.find((p) => p.dataKey === key)?.value ?? 0

  return (
    <div
      className="px-3 py-2 rounded-md text-xs flex flex-col gap-1"
      style={{
        background: 'var(--probex-surface-2)',
        border:     '1px solid var(--probex-border-default)',
      }}
    >
      <span style={{ color: 'var(--probex-text-muted)' }}>{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--probex-primary)' }} />
        <span style={{ color: 'var(--probex-text-secondary)' }}>Consensus</span>
        <span className="font-bold ml-auto" style={{ color: 'var(--probex-primary)' }}>{get('score')}%</span>
      </div>
      {showBreakdown && (
        <>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--probex-positive)' }} />
            <span style={{ color: 'var(--probex-text-secondary)' }}>Institutional</span>
            <span className="font-semibold ml-auto" style={{ color: 'var(--probex-positive)' }}>{get('inst')}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--probex-warning)' }} />
            <span style={{ color: 'var(--probex-text-secondary)' }}>Retail</span>
            <span className="font-semibold ml-auto" style={{ color: 'var(--probex-warning)' }}>{get('retail')}%</span>
          </div>
        </>
      )}
    </div>
  )
}

function formatAxisLabel(ts: number, range: TimeRange): string {
  const d = new Date(ts)
  switch (range) {
    case '1h':
    case '24h': return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    default:    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}
