'use client'

/** Market Analytics — prediction-market activity and per-segment performance. */

import { useMemo } from 'react'
import {
  ComposedChart, Bar, Line, BarChart, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn, formatCompact, formatPercent } from '@/lib/utils'
import { StatCard } from '@/components/ui/StatCard'
import { useAnalyticsTimeframe, useAnalyticsSegment, useAnalyticsStore } from '@/store/analyticsStore'
import { ORDERED_SEGMENTS, getSegmentMeta } from '@/config/marketSegments'
import { useMarketActivityHistory, useSegmentAnalytics } from '@/hooks/useServices'
import {
  AnalyticsCard, SectionHeader, SeriesTooltip, Th, Td,
  sliceByTimeframe, axisDateLabel, CHART, AXIS_TICK,
} from './shared'
import type { SegmentPerformanceRecord } from '@/types/analytics'
import type { BitcoinSegment } from '@/types/market'

interface MarketAnalyticsProps {
  segments?:  SegmentPerformanceRecord[]
  className?: string
}

export function MarketAnalytics({ segments, className }: MarketAnalyticsProps) {
  const timeframe       = useAnalyticsTimeframe()
  const activeSegment   = useAnalyticsSegment()
  const { setSegment }  = useAnalyticsStore()
  const segmentData     = useSegmentAnalytics().data ?? []
  const activityPts     = useMarketActivityHistory().data ?? []
  const segs            = segments && segments.length >= ORDERED_SEGMENTS.length ? segments : segmentData

  const stats = useMemo(() => {
    const hist = sliceByTimeframe(activityPts, timeframe)
    const activeMarkets = hist.at(-1)?.activeMarkets ?? 0
    const totalVolume   = hist.reduce((s, p) => s + p.totalVolume, 0)
    const resolved      = hist.reduce((s, p) => s + p.resolvedCount, 0)
    const top = [...segs].sort((a, b) => b.totalVolume - a.totalVolume)[0]
    return { activeMarkets, totalVolume, resolved, topSegment: top ? getSegmentMeta(top.segment).label : '—' }
  }, [activityPts, timeframe, segs])

  return (
    <section className={cn('flex flex-col gap-4', className)} aria-label="Market analytics">
      <SectionHeader label="Market Analytics" timeframe={timeframe} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active Markets" value={String(stats.activeMarkets)} valueColor="var(--probex-primary)" />
        <StatCard label="Total Volume"   value={`$${formatCompact(stats.totalVolume)}`} />
        <StatCard label="Resolved"       value={String(stats.resolved)} deltaLabel="this period" />
        <StatCard label="Top Segment"    value={stats.topSegment} valueColor="var(--probex-chart-secondary)" />
      </div>

      {/* Segment filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar" role="group" aria-label="Segment filter">
        <SegmentPill label="All" isActive={activeSegment === null} onClick={() => setSegment(null)} />
        {ORDERED_SEGMENTS.map((seg) => (
          <SegmentPill key={seg.id} label={seg.shortLabel} isActive={activeSegment === seg.id} onClick={() => setSegment(seg.id)} />
        ))}
      </div>

      <AnalyticsCard title="Market Activity" subtitle="Daily volume and active market count">
        <MarketActivityChart />
      </AnalyticsCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AnalyticsCard title="Segment Accuracy" subtitle="Consensus accuracy by Bitcoin segment">
          <SegmentPerformanceChart segs={segs} activeSegment={activeSegment} />
        </AnalyticsCard>
        <AnalyticsCard title="Segment Performance" subtitle="Accuracy, volume, and win rate by segment">
          <SegmentPerformanceTable segs={segs} activeSegment={activeSegment} />
        </AnalyticsCard>
      </div>
    </section>
  )
}

// ─── Activity chart ─────────────────────────────────────────────────────────

function MarketActivityChart({ height = 240 }: { height?: number }) {
  const tf  = useAnalyticsTimeframe()
  const pts = useMarketActivityHistory().data ?? []
  const data = useMemo(
    () => sliceByTimeframe(pts, tf).map((p) => ({
      label: axisDateLabel(p.timestamp), volume: p.totalVolume, markets: p.activeMarkets,
    })),
    [pts, tf],
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
        <YAxis yAxisId="vol" tick={AXIS_TICK} tickLine={false} axisLine={false} width={42} tickFormatter={(v: number) => `$${formatCompact(v)}`} />
        <YAxis yAxisId="mkt" orientation="right" tick={AXIS_TICK} tickLine={false} axisLine={false} width={28} />
        <Tooltip cursor={{ fill: 'var(--probex-surface-2)', opacity: 0.4 }} content={<SeriesTooltip labelMap={{ volume: 'Volume', markets: 'Active Markets' }} fmt={(v) => (v >= 1000 ? `$${formatCompact(v)}` : String(v))} />} />
        <Bar yAxisId="vol" dataKey="volume" fill={CHART.primary} fillOpacity={0.55} />
        <Line yAxisId="mkt" type="monotone" dataKey="markets" stroke={CHART.tertiary} strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ─── Segment accuracy bar ───────────────────────────────────────────────────

function SegmentPerformanceChart({
  segs, activeSegment, height = 260,
}: {
  segs: SegmentPerformanceRecord[]
  activeSegment: BitcoinSegment | null
  height?: number
}) {
  const data = useMemo(
    () => [...segs]
      .sort((a, b) => b.avgAccuracy - a.avgAccuracy)
      .map((s) => ({ name: getSegmentMeta(s.segment).shortLabel, accuracy: Math.round(s.avgAccuracy * 100), segment: s.segment })),
    [segs],
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
        <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={64} />
        <Tooltip cursor={{ fill: 'var(--probex-surface-2)', opacity: 0.4 }} content={<SeriesTooltip fmt={(v) => `${v}%`} labelMap={{ accuracy: 'Accuracy' }} />} />
        <Bar dataKey="accuracy" radius={[0, 3, 3, 0]}>
          {data.map((d) => (
            <Cell key={d.segment} fill={activeSegment === null || activeSegment === d.segment ? CHART.primary : CHART.secondary} fillOpacity={activeSegment === null || activeSegment === d.segment ? 0.9 : 0.4} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Segment table ──────────────────────────────────────────────────────────

function SegmentPerformanceTable({
  segs, activeSegment,
}: {
  segs: SegmentPerformanceRecord[]
  activeSegment: BitcoinSegment | null
}) {
  const rows = useMemo(() => [...segs].sort((a, b) => b.avgAccuracy - a.avgAccuracy), [segs])

  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--probex-border)' }}>
            <Th>Segment</Th>
            <Th right>Accuracy</Th>
            <Th right>Consensus</Th>
            <Th right>Volume</Th>
            <Th right>Win Rate</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isActive = activeSegment === r.segment
            return (
              <tr key={r.segment} style={{ borderBottom: '1px solid var(--probex-border)', background: isActive ? 'var(--probex-surface-2)' : 'transparent' }}>
                <Td strong={isActive} color={isActive ? 'var(--probex-primary)' : 'var(--probex-text-secondary)'}>{getSegmentMeta(r.segment).label}</Td>
                <Td right strong>{formatPercent(r.avgAccuracy)}</Td>
                <Td right>{Math.round(r.avgConsensus * 100)}</Td>
                <Td right muted>${formatCompact(r.totalVolume)}</Td>
                <Td right color={r.winRate >= 0.5 ? 'var(--probex-positive)' : 'var(--probex-negative)'}>{formatPercent(r.winRate)}</Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Segment pill ───────────────────────────────────────────────────────────

function SegmentPill({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all duration-120 border"
      style={isActive ? {
        background:  'var(--probex-primary-dim)',
        borderColor: 'var(--probex-yes-border)',
        color:       'var(--probex-primary)',
      } : {
        background:  'transparent',
        borderColor: 'var(--probex-border)',
        color:       'var(--probex-text-secondary)',
      }}
    >
      {label}
    </button>
  )
}
