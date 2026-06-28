'use client'

/** Institutional Analytics — smart-money flow, participation, and institutional-vs-retail divergence. */

import { useMemo } from 'react'
import {
  ComposedChart, Bar, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn, formatCompact, formatPercent } from '@/lib/utils'
import { StatCard } from '@/components/ui/StatCard'
import { useAnalyticsTimeframe } from '@/store/analyticsStore'
import { getInstitutionalFlowHistory, getConsensusAccuracyHistory, INSTITUTIONAL_FLOW_SUMMARY } from '@/mock/analytics'
import { MOCK_MARKETS } from '@/mock/markets'
import { MOCK_CONSENSUS_MAP } from '@/mock/consensus'
import {
  AnalyticsCard, SectionHeader, SeriesTooltip, Th, Td,
  sliceByTimeframe, axisDateLabel, CHART, AXIS_TICK,
} from './shared'
import type { InstitutionalFlowSummary } from '@/types/analytics'

interface InstitutionalAnalyticsProps {
  summary?:   InstitutionalFlowSummary
  className?: string
}

const BIAS_COLOR: Record<string, string> = {
  bullish: 'var(--probex-positive)',
  bearish: 'var(--probex-negative)',
  neutral: 'var(--probex-warning)',
}

export function InstitutionalAnalytics({ summary, className }: InstitutionalAnalyticsProps) {
  const timeframe = useAnalyticsTimeframe()
  const data      = summary ?? INSTITUTIONAL_FLOW_SUMMARY

  return (
    <section className={cn('flex flex-col gap-4', className)} aria-label="Institutional analytics">
      <SectionHeader label="Institutional Analytics" timeframe={timeframe} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Net Flow"           value={`$${formatCompact(data.netFlow)}`}     valueColor={data.netFlow >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)'} deltaLabel={data.period} />
        <StatCard label="Dominant Bias"      value={data.dominantBias}                      valueColor={BIAS_COLOR[data.dominantBias] ?? 'var(--probex-text-primary)'} />
        <StatCard label="Avg Participation"  value={formatPercent(data.avgParticipation)}   valueColor="var(--probex-chart-secondary)" />
        <StatCard label="Bias Streak"        value={`${data.streakDays}d`}                  deltaLabel="consistent direction" />
      </div>

      <AnalyticsCard title="Institutional Flow" subtitle="Daily buy / sell volume and net institutional flow">
        <InstitutionalFlowChart />
      </AnalyticsCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AnalyticsCard title="Participation Trend" subtitle="Institutional share of total market volume">
          <ParticipationTrendChart />
        </AnalyticsCard>
        <AnalyticsCard title="Smart Money vs Retail" subtitle="Institutional accuracy premium over retail">
          <SmartMoneyDivergenceChart />
        </AnalyticsCard>
      </div>

      <AnalyticsCard title="Top Institutional Markets" subtitle="Markets ranked by institutional participation">
        <TopInstitutionalMarkets />
      </AnalyticsCard>
    </section>
  )
}

// ─── Flow chart ─────────────────────────────────────────────────────────────

function InstitutionalFlowChart({ height = 260 }: { height?: number }) {
  const tf = useAnalyticsTimeframe()
  const data = useMemo(
    () => sliceByTimeframe(getInstitutionalFlowHistory(), tf).map((p) => ({
      label: axisDateLabel(p.timestamp), buy: p.buyVolume, sell: -p.sellVolume, net: p.netFlow,
    })),
    [tf],
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} stackOffset="sign" margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={46} tickFormatter={(v: number) => `$${formatCompact(v)}`} />
        <Tooltip cursor={{ fill: 'var(--probex-surface-2)', opacity: 0.4 }} content={<SeriesTooltip fmt={(v) => `$${formatCompact(v)}`} labelMap={{ buy: 'Buy Volume', sell: 'Sell Volume', net: 'Net Flow' }} />} />
        <Bar dataKey="buy"  stackId="v" fill={CHART.positive} />
        <Bar dataKey="sell" stackId="v" fill={CHART.negative} />
        <Line type="monotone" dataKey="net" stroke={CHART.primary} strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ─── Participation trend ────────────────────────────────────────────────────

function ParticipationTrendChart({ height = 200 }: { height?: number }) {
  const tf = useAnalyticsTimeframe()
  const data = useMemo(
    () => sliceByTimeframe(getInstitutionalFlowHistory(), tf).map((p) => ({
      label: axisDateLabel(p.timestamp), participation: Math.round(p.instParticipation * 100),
    })),
    [tf],
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="instPartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.secondary} stopOpacity={0.3} />
            <stop offset="100%" stopColor={CHART.secondary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
        <YAxis domain={[0, 100]} tick={AXIS_TICK} tickLine={false} axisLine={false} width={34} tickFormatter={(v: number) => `${v}%`} />
        <Tooltip content={<SeriesTooltip fmt={(v) => `${v}%`} labelMap={{ participation: 'Inst. Share' }} />} />
        <Area type="monotone" dataKey="participation" stroke={CHART.secondary} strokeWidth={2} fill="url(#instPartGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Smart money divergence ─────────────────────────────────────────────────

function SmartMoneyDivergenceChart({ height = 200 }: { height?: number }) {
  const tf = useAnalyticsTimeframe()
  const data = useMemo(
    () => sliceByTimeframe(getConsensusAccuracyHistory(), tf).map((p) => ({
      label: axisDateLabel(p.timestamp), premium: Math.round((p.instAccuracy - p.retailAccuracy) * 1000) / 10,
    })),
    [tf],
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="divergeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.positive} stopOpacity={0.3} />
            <stop offset="100%" stopColor={CHART.positive} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={36} tickFormatter={(v: number) => `${v}pp`} />
        <Tooltip content={<SeriesTooltip fmt={(v) => `${v}pp`} labelMap={{ premium: 'Inst. Premium' }} />} />
        <Area type="monotone" dataKey="premium" stroke={CHART.positive} strokeWidth={2} fill="url(#divergeGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Top institutional markets ──────────────────────────────────────────────

function TopInstitutionalMarkets() {
  const rows = useMemo(() => {
    return Object.entries(MOCK_CONSENSUS_MAP)
      .map(([id, c]) => ({
        id,
        title: MOCK_MARKETS.find((m) => (m.id as string) === id)?.title ?? id,
        participation: c.institutionalParticipation,
        score: c.score,
        bias: c.bias,
      }))
      .sort((a, b) => b.participation - a.participation)
      .slice(0, 6)
  }, [])

  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--probex-border)' }}>
            <Th>Market</Th>
            <Th right>Consensus</Th>
            <Th right>Inst. Share</Th>
            <Th right>Bias</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid var(--probex-border)' }}>
              <td style={{ padding: '10px 12px', maxWidth: 320 }}>
                <span className="text-sm truncate block" style={{ color: 'var(--probex-text-primary)' }}>{r.title}</span>
              </td>
              <Td right strong>{Math.round(r.score * 100)}</Td>
              <Td right color="var(--probex-chart-secondary)">{formatPercent(r.participation)}</Td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded capitalize"
                  style={{ background: `color-mix(in srgb, ${BIAS_COLOR[r.bias] ?? 'var(--probex-text-muted)'} 14%, transparent)`, color: BIAS_COLOR[r.bias] ?? 'var(--probex-text-muted)' }}>
                  {r.bias}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
