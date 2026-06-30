'use client'

/** ETF Analytics — Bitcoin ETF daily flows, cumulative AUM, and product share. */

import { useMemo } from 'react'
import {
  ComposedChart, Bar, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn, formatPercent } from '@/lib/utils'
import { StatCard } from '@/components/ui/StatCard'
import { useAnalyticsTimeframe } from '@/store/analyticsStore'
import { useETFFlowHistory, useETFSummary } from '@/hooks/useServices'
import {
  AnalyticsCard, SectionHeader, SeriesTooltip, Th, Td,
  sliceByTimeframe, axisDateLabel, CHART, AXIS_TICK,
} from './shared'
import type { ETFAnalyticsSummary } from '@/types/analytics'

interface ETFAnalyticsProps {
  summary?:   ETFAnalyticsSummary
  className?: string
}

/** Format USD millions: <1000 → $NM, else → $N.NB */
function fmtUsdM(v: number): string {
  return Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(1)}B` : `$${Math.round(v)}M`
}

export function ETFAnalytics({ summary, className }: ETFAnalyticsProps) {
  const timeframe  = useAnalyticsTimeframe()
  const summaryData = useETFSummary().data
  const data        = summary ?? summaryData
  const hist        = useETFFlowHistory().data ?? []

  const ibitShare = useMemo(() => {
    const ibit  = hist.reduce((s, p) => s + Math.max(0, p.ibitFlow), 0)
    const other = hist.reduce((s, p) => s + Math.max(0, p.otherFlow), 0)
    return ibit + other > 0 ? ibit / (ibit + other) : 0
  }, [hist])

  if (!data) return null

  return (
    <section className={cn('flex flex-col gap-4', className)} aria-label="ETF analytics">
      <SectionHeader label="ETF Flow Analytics" timeframe={timeframe} />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Net Inflow"      value={fmtUsdM(data.totalNetInflow)}     valueColor="var(--probex-positive)" deltaLabel={data.period} />
        <StatCard label="Largest Day"     value={fmtUsdM(data.largestSingleDay)}   valueColor="var(--probex-primary)" />
        <StatCard label="Positive Days"   value={formatPercent(data.positiveDaysPct)} />
        <StatCard label="Total AUM"       value={fmtUsdM(data.currentAum)} />
        <StatCard label="IBIT Share"      value={formatPercent(ibitShare)}         valueColor="var(--probex-chart-secondary)" />
        <StatCard label="Price Corr."     value={data.abiFlowCorrelation.toFixed(2)} deltaLabel="flow vs BTC price" />
      </div>

      <AnalyticsCard title="ETF Daily Flows & AUM" subtitle="Stacked daily net inflow by product + cumulative AUM (right axis)">
        <ETFFlowChart />
      </AnalyticsCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AnalyticsCard title="Product Flow Share" subtitle="IBIT vs all other products">
          <ETFProductBreakdownChart ibitShare={ibitShare} />
        </AnalyticsCard>
        <AnalyticsCard title="Product Table" subtitle="Share of net inflow by product">
          <ETFProductTable ibitShare={ibitShare} totalNetInflow={data.totalNetInflow} />
        </AnalyticsCard>
      </div>
    </section>
  )
}

// ─── Flow + AUM chart (reused, compact, on the Overview tab) ────────────────

export function ETFFlowChart({ height = 260 }: { height?: number }) {
  const tf  = useAnalyticsTimeframe()
  const pts = useETFFlowHistory().data ?? []
  const data = useMemo(
    () => sliceByTimeframe(pts, tf).map((p) => ({
      label: axisDateLabel(p.timestamp), ibit: p.ibitFlow, other: p.otherFlow, aum: p.cumulativeAum,
    })),
    [pts, tf],
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
        <YAxis yAxisId="flow" tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => `$${v}M`} />
        <YAxis yAxisId="aum" orientation="right" tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}B`} />
        <Tooltip cursor={{ fill: 'var(--probex-surface-2)', opacity: 0.4 }} content={<SeriesTooltip fmt={fmtUsdM} labelMap={{ ibit: 'IBIT', other: 'Other', aum: 'Cumulative AUM' }} />} />
        <Bar yAxisId="flow" dataKey="ibit"  stackId="f" fill={CHART.primary} />
        <Bar yAxisId="flow" dataKey="other" stackId="f" fill={CHART.secondary} />
        <Line yAxisId="aum" type="monotone" dataKey="aum" stroke={CHART.tertiary} strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ─── Product breakdown donut ────────────────────────────────────────────────

function ETFProductBreakdownChart({ ibitShare, height = 220 }: { ibitShare: number; height?: number }) {
  const data = [
    { name: 'IBIT',  value: Math.round(ibitShare * 100),       color: CHART.primary },
    { name: 'Other', value: Math.round((1 - ibitShare) * 100), color: CHART.secondary },
  ]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="var(--probex-surface)" strokeWidth={2}>
          {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Pie>
        <Tooltip content={<SeriesTooltip fmt={(v) => `${v}%`} />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ─── Product table ──────────────────────────────────────────────────────────

function ETFProductTable({ ibitShare, totalNetInflow }: { ibitShare: number; totalNetInflow: number }) {
  const rows = [
    { product: 'iShares Bitcoin Trust (IBIT)', share: ibitShare,     color: CHART.primary },
    { product: 'All Other Products',           share: 1 - ibitShare, color: CHART.secondary },
  ]
  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--probex-border)' }}>
            <Th>Product</Th>
            <Th right>Flow Share</Th>
            <Th right>Net Flow</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.product} style={{ borderBottom: '1px solid var(--probex-border)' }}>
              <td style={{ padding: '10px 12px' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} aria-hidden="true" />
                  <span className="text-sm" style={{ color: 'var(--probex-text-primary)' }}>{r.product}</span>
                </div>
              </td>
              <Td right strong>{formatPercent(r.share)}</Td>
              <Td right color="var(--probex-positive)">{fmtUsdM(totalNetInflow * r.share)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
