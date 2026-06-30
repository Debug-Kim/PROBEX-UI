'use client'

/** Consensus Analytics — accuracy, signal-strength, and confidence-trend charts. */

import { useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn, formatPercent, formatCurrency } from '@/lib/utils'
import { StatCard } from '@/components/ui/StatCard'
import { useAnalyticsTimeframe } from '@/store/analyticsStore'
import {
  useConsensusAccuracyHistory, useConsensusStrengthHistory, useConfidenceTrendHistory,
  useConsensusSummary, useSignalPerformance,
} from '@/hooks/useServices'
import {
  AnalyticsCard, SectionHeader, SeriesTooltip, Th, Td,
  sliceByTimeframe, axisDateLabel, CHART, AXIS_TICK,
} from './shared'
import type { ConsensusAnalyticsSummary } from '@/types/analytics'
import type { SignalLevel } from '@/types/consensus'

interface ConsensusAnalyticsProps {
  summary?:   ConsensusAnalyticsSummary
  className?: string
}

export function ConsensusAnalytics({ summary, className }: ConsensusAnalyticsProps) {
  const timeframe       = useAnalyticsTimeframe()
  const summaryData     = useConsensusSummary().data
  const data            = summary ?? summaryData
  const accuracyPts     = useConsensusAccuracyHistory().data ?? []
  const signalPerf      = useSignalPerformance().data ?? []

  const strongWinRate = signalPerf.find((s) => s.signal === 'strong')?.winRate ?? 0
  const premium = useMemo(() => {
    const last = accuracyPts.at(-1)
    return last ? last.instAccuracy - last.retailAccuracy : 0
  }, [accuracyPts])

  if (!data) return null

  return (
    <section className={cn('flex flex-col gap-4', className)} aria-label="Consensus Engine analytics">
      <SectionHeader label="Consensus Engine Analytics" timeframe={timeframe} primary />

      {/* Accuracy metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Avg Accuracy"            value={formatPercent(data.avgAccuracy)}  valueColor="var(--probex-primary)"        deltaLabel={data.period} />
        <StatCard label="Peak Accuracy"           value={formatPercent(data.peakAccuracy)} valueColor="var(--probex-positive)" />
        <StatCard label="Institutional Premium"   value={formatPercent(premium)}           valueColor="var(--probex-chart-secondary)" deltaLabel="inst − retail" />
        <StatCard label="Strong-Signal Win Rate"  value={formatPercent(strongWinRate)}     valueColor="var(--probex-positive)" />
      </div>

      <AnalyticsCard title="Consensus Accuracy" subtitle="Overall vs institutional vs retail signal accuracy">
        <ConsensusAccuracyChart />
      </AnalyticsCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AnalyticsCard title="Signal Strength Distribution" subtitle="Markets by consensus strength band">
          <SignalStrengthDistribution />
        </AnalyticsCard>
        <AnalyticsCard title="Confidence Trend" subtitle="High / medium / low confidence readings">
          <ConfidenceTrendChart />
        </AnalyticsCard>
      </div>

      <AnalyticsCard title="Signal Performance" subtitle="Accuracy, win rate, and average return by signal level">
        <SignalPerformanceTable />
      </AnalyticsCard>
    </section>
  )
}

// ─── Accuracy chart (reused on the Overview tab) ────────────────────────────

export function ConsensusAccuracyChart({ height = 240 }: { height?: number }) {
  const tf  = useAnalyticsTimeframe()
  const pts = useConsensusAccuracyHistory().data ?? []
  const data = useMemo(
    () => sliceByTimeframe(pts, tf).map((p) => ({
      label:   axisDateLabel(p.timestamp),
      overall: Math.round(p.overallAccuracy * 100),
      inst:    Math.round(p.instAccuracy * 100),
      retail:  Math.round(p.retailAccuracy * 100),
    })),
    [pts, tf],
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
        <YAxis domain={[0, 100]} tick={AXIS_TICK} tickLine={false} axisLine={false} width={34} tickFormatter={(v: number) => `${v}%`} />
        <Tooltip content={<SeriesTooltip fmt={(v) => `${v}%`} labelMap={{ overall: 'Overall', inst: 'Institutional', retail: 'Retail' }} />} />
        <Line type="monotone" dataKey="overall" stroke={CHART.primary} strokeWidth={2} dot={false} activeDot={{ r: 3, fill: CHART.primary, stroke: CHART.bg, strokeWidth: 2 }} />
        <Line type="monotone" dataKey="inst"    stroke={CHART.positive} strokeWidth={1.25} strokeDasharray="4 3" dot={false} />
        <Line type="monotone" dataKey="retail"  stroke={CHART.warning}  strokeWidth={1.25} strokeDasharray="4 3" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Signal strength distribution ───────────────────────────────────────────

function SignalStrengthDistribution({ height = 200 }: { height?: number }) {
  const tf  = useAnalyticsTimeframe()
  const pts = useConsensusStrengthHistory().data ?? []
  const data = useMemo(
    () => sliceByTimeframe(pts, tf).map((p) => ({
      label: axisDateLabel(p.timestamp), strong: p.strongCount, neutral: p.neutralCount, weak: p.weakCount,
    })),
    [pts, tf],
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={28} />
        <Tooltip content={<SeriesTooltip labelMap={{ strong: 'Strong', neutral: 'Neutral', weak: 'Weak' }} />} />
        <Area type="monotone" dataKey="strong"  stackId="s" stroke={CHART.positive} fill={CHART.positive} fillOpacity={0.25} />
        <Area type="monotone" dataKey="neutral" stackId="s" stroke={CHART.warning}  fill={CHART.warning}  fillOpacity={0.20} />
        <Area type="monotone" dataKey="weak"    stackId="s" stroke={CHART.negative} fill={CHART.negative} fillOpacity={0.20} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Confidence trend ───────────────────────────────────────────────────────

function ConfidenceTrendChart({ height = 200 }: { height?: number }) {
  const tf  = useAnalyticsTimeframe()
  const pts = useConfidenceTrendHistory().data ?? []
  const data = useMemo(
    () => sliceByTimeframe(pts, tf).map((p) => ({
      label: axisDateLabel(p.timestamp), high: p.high, medium: p.medium, low: p.low,
    })),
    [pts, tf],
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={28} />
        <Tooltip cursor={{ fill: 'var(--probex-surface-2)', opacity: 0.4 }} content={<SeriesTooltip labelMap={{ high: 'High', medium: 'Medium', low: 'Low' }} />} />
        <Bar dataKey="high"   stackId="c" fill={CHART.positive} />
        <Bar dataKey="medium" stackId="c" fill={CHART.warning} />
        <Bar dataKey="low"    stackId="c" fill={CHART.negative} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Signal performance table (reused on the Overview tab) ──────────────────

const SIGNAL_COLOR: Record<SignalLevel, string> = {
  strong:   'var(--probex-positive)',
  moderate: 'var(--probex-warning)',
  weak:     'var(--probex-text-muted)',
}

export function SignalPerformanceTable() {
  const rows = useSignalPerformance().data ?? []
  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--probex-border)' }}>
            <Th>Signal</Th>
            <Th right>Accuracy</Th>
            <Th right>Win Rate</Th>
            <Th right>Avg Return</Th>
            <Th right>Sample</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.signal} style={{ borderBottom: '1px solid var(--probex-border)' }}>
              <td style={{ padding: '10px 12px' }}>
                <span
                  className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded capitalize"
                  style={{ background: `color-mix(in srgb, ${SIGNAL_COLOR[r.signal]} 14%, transparent)`, color: SIGNAL_COLOR[r.signal] }}
                >
                  {r.signal}
                </span>
              </td>
              <Td right strong>{formatPercent(r.accuracy)}</Td>
              <Td right>{formatPercent(r.winRate)}</Td>
              <Td right color={r.avgReturnWhenAligned >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)'}>
                {formatCurrency(r.avgReturnWhenAligned)}
              </Td>
              <Td right muted>{r.sampleCount}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
