'use client'

/** Portfolio Analytics — performance cross-referenced with consensus alignment. */

import { useMemo } from 'react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn, formatCurrency, formatDelta, formatPercent } from '@/lib/utils'
import { StatCard } from '@/components/ui/StatCard'
import { useAnalyticsTimeframe } from '@/store/analyticsStore'
import { getSegmentMeta } from '@/config/marketSegments'
import { SEGMENT_ANALYTICS, PORTFOLIO_ANALYTICS_SUMMARY } from '@/mock/analytics'
import { AnalyticsCard, SectionHeader, SeriesTooltip, CHART, AXIS_TICK } from './shared'
import type { PortfolioAnalyticsSummary } from '@/types/analytics'

interface PortfolioAnalyticsProps {
  summary?:   PortfolioAnalyticsSummary
  className?: string
}

export function PortfolioAnalytics({ summary, className }: PortfolioAnalyticsProps) {
  const timeframe = useAnalyticsTimeframe()
  const data      = summary ?? PORTFOLIO_ANALYTICS_SUMMARY

  const bestWinRate  = SEGMENT_ANALYTICS.find((s) => s.segment === data.bestSegment)?.winRate ?? 0
  const worstWinRate = SEGMENT_ANALYTICS.find((s) => s.segment === data.worstSegment)?.winRate ?? 0

  const premiumData = useMemo(() => ([
    { name: 'Consensus-Aligned', value: Math.round(data.totalReturnPct * 1000) / 10, key: 'aligned' },
    { name: 'Baseline',          value: Math.round((data.totalReturnPct - data.consensusLiftPct) * 1000) / 10, key: 'baseline' },
  ]), [data])

  const winRateData = useMemo(
    () => [...SEGMENT_ANALYTICS]
      .sort((a, b) => b.winRate - a.winRate)
      .map((s) => ({ name: getSegmentMeta(s.segment).shortLabel, winRate: Math.round(s.winRate * 100), segment: s.segment })),
    [],
  )

  return (
    <section className={cn('flex flex-col gap-4', className)} aria-label="Portfolio analytics">
      <SectionHeader label="Portfolio Analytics" timeframe={timeframe} />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Total Return"  value={formatCurrency(data.totalReturn)} valueColor={data.totalReturn >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)'} />
        <StatCard label="Return %"      value={formatDelta(data.totalReturnPct)} valueColor={data.totalReturnPct >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)'} />
        <StatCard label="Consensus Lift" value={formatDelta(data.consensusLiftPct)} valueColor="var(--probex-primary)" deltaLabel="vs non-aligned" />
        <StatCard label="Sharpe (approx)" value={data.sharpeApprox.toFixed(2)} />
        <StatCard label="Best Segment"  value={getSegmentMeta(data.bestSegment).shortLabel}  valueColor="var(--probex-positive)" deltaLabel={`${formatPercent(bestWinRate)} win rate`} />
        <StatCard label="Worst Segment" value={getSegmentMeta(data.worstSegment).shortLabel} valueColor="var(--probex-negative)" deltaLabel={`${formatPercent(worstWinRate)} win rate`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AnalyticsCard title="Consensus Alignment Premium" subtitle="Return on consensus-aligned positions vs baseline">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={premiumData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={110} />
              <Tooltip cursor={{ fill: 'var(--probex-surface-2)', opacity: 0.4 }} content={<SeriesTooltip fmt={(v) => `${v}%`} labelMap={{ value: 'Return' }} />} />
              <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                {premiumData.map((d) => (
                  <Cell key={d.key} fill={d.key === 'aligned' ? CHART.primary : CHART.muted} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        <AnalyticsCard title="Segment Win Rate" subtitle="Portfolio win rate by Bitcoin segment">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={winRateData} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={64} />
              <Tooltip cursor={{ fill: 'var(--probex-surface-2)', opacity: 0.4 }} content={<SeriesTooltip fmt={(v) => `${v}%`} labelMap={{ winRate: 'Win Rate' }} />} />
              <Bar dataKey="winRate" radius={[0, 3, 3, 0]}>
                {winRateData.map((d) => {
                  const color = d.segment === data.bestSegment ? CHART.positive
                    : d.segment === data.worstSegment ? CHART.negative
                    : CHART.secondary
                  return <Cell key={d.segment} fill={color} fillOpacity={0.85} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      </div>
    </section>
  )
}
