'use client'

/** On-Chain Analytics — MVRV, SOPR, exchange reserves, hashrate, and related Bitcoin signals. */

import { useMemo } from 'react'
import {
  AreaChart, Area, ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/ui/StatCard'
import { useAnalyticsStore, useAnalyticsTimeframe } from '@/store/analyticsStore'
import {
  useOnChainHistory, useConsensusAccuracyHistory,
  useOnChainSnapshots, useOnChainSummary,
} from '@/hooks/useServices'
import {
  AnalyticsCard, SectionHeader, SeriesTooltip,
  sliceByTimeframe, axisDateLabel, CHART, AXIS_TICK,
} from './shared'
import type { OnChainSummary, OnChainMetricId } from '@/types/analytics'

interface OnChainAnalyticsProps {
  summary?:   OnChainSummary
  className?: string
}

const ON_CHAIN_METRICS: Array<{ id: OnChainMetricId; label: string; description: string }> = [
  { id: 'mvrv',               label: 'MVRV',               description: 'Market Value to Realized Value' },
  { id: 'sopr',               label: 'SOPR',               description: 'Spent Output Profit Ratio'      },
  { id: 'exchange-reserve',   label: 'Exchange Reserve',   description: 'BTC held on exchanges'          },
  { id: 'hashrate',           label: 'Hashrate',           description: 'Network hash power (EH/s)'      },
  { id: 'difficulty',         label: 'Difficulty',         description: 'Mining difficulty (T)'          },
  { id: 'whale-accumulation', label: 'Whale Accumulation', description: 'Net 1000+ BTC wallet flows'     },
  { id: 'nupl',               label: 'NUPL',               description: 'Net Unrealized Profit/Loss'     },
  { id: 'puell-multiple',     label: 'Puell Multiple',     description: 'Daily miner revenue / 365d avg' },
]

const SIGNAL_COLOR: Record<string, string> = {
  bullish: 'var(--probex-positive)',
  bearish: 'var(--probex-negative)',
  neutral: 'var(--probex-warning)',
}

function fmtMetric(v: number): string {
  return Math.abs(v) >= 100 ? Math.round(v).toLocaleString() : v.toFixed(2)
}

export function OnChainAnalytics({ summary, className }: OnChainAnalyticsProps) {
  const timeframe = useAnalyticsTimeframe()
  const { selectedOnChain, setOnChain } = useAnalyticsStore()
  const summaryData = useOnChainSummary().data
  const data        = summary ?? summaryData
  const active: OnChainMetricId = selectedOnChain ?? 'mvrv'
  const activeMeta = ON_CHAIN_METRICS.find((m) => m.id === active)

  if (!data) return null

  return (
    <section className={cn('flex flex-col gap-4', className)} aria-label="On-chain analytics">
      <SectionHeader label="On-Chain Analytics" timeframe={timeframe} />

      {/* Composite summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <StatCard label="Overall Signal"  value={data.overallSignal} valueColor={SIGNAL_COLOR[data.overallSignal] ?? 'var(--probex-text-primary)'} />
        <StatCard label="Bullish"         value={String(data.bullishCount)} valueColor="var(--probex-positive)" />
        <StatCard label="Bearish"         value={String(data.bearishCount)} valueColor="var(--probex-negative)" />
        <StatCard label="Neutral"         value={String(data.neutralCount)} valueColor="var(--probex-warning)" />
        <StatCard label="Consensus Corr." value={data.consensusCorr.toFixed(2)} deltaLabel="vs engine score" />
      </div>

      {/* Signal grid */}
      <OnChainSignalGrid selected={active} onSelect={(id) => setOnChain(selectedOnChain === id ? null : id)} />

      {/* Deep-dive */}
      <AnalyticsCard title={`${activeMeta?.label ?? 'Metric'} History`} subtitle={activeMeta?.description ?? ''}>
        <OnChainMetricChart metricId={active} />
      </AnalyticsCard>

      {/* Correlation scatter */}
      <AnalyticsCard title="On-Chain vs Consensus" subtitle={`Normalized on-chain signal vs consensus accuracy · r ≈ ${data.consensusCorr.toFixed(2)}`}>
        <OnChainConsensusScatter metricId={active} />
      </AnalyticsCard>
    </section>
  )
}

// ─── Signal grid ────────────────────────────────────────────────────────────

function OnChainSignalGrid({ selected, onSelect }: { selected: OnChainMetricId; onSelect: (id: OnChainMetricId) => void }) {
  const snapshots = useOnChainSnapshots().data ?? {}
  const cards = useMemo(
    () => ON_CHAIN_METRICS.map((m) => {
      const last = snapshots[m.id]
      return {
        ...m,
        value:      last?.value ?? 0,
        normalized: last?.normalized ?? 0,
        signal:     last?.signal ?? 'neutral',
      }
    }),
    [snapshots],
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => {
        const isActive = c.id === selected
        const color    = SIGNAL_COLOR[c.signal] ?? 'var(--probex-text-muted)'
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            aria-pressed={isActive}
            title={c.description}
            className="flex flex-col gap-2 p-3 rounded-xl text-left cursor-pointer transition-all duration-100"
            style={{
              background:  'var(--probex-surface)',
              border:      `1px solid ${isActive ? 'var(--probex-primary)' : 'var(--probex-border)'}`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xs font-semibold uppercase tracking-wider truncate" style={{ color: 'var(--probex-text-muted)' }}>{c.label}</span>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />
            </div>
            <span className="text-lg font-bold tabular-nums leading-none" style={{ color: 'var(--probex-text-primary)' }}>{fmtMetric(c.value)}</span>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--probex-border-default)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.round(c.normalized * 100)}%`, background: color }} />
            </div>
            <span className="text-2xs font-semibold capitalize" style={{ color }}>{c.signal}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Metric deep-dive ───────────────────────────────────────────────────────

function OnChainMetricChart({ metricId, height = 240 }: { metricId: OnChainMetricId; height?: number }) {
  const tf  = useAnalyticsTimeframe()
  const pts = useOnChainHistory(metricId).data ?? []
  const data = useMemo(
    () => sliceByTimeframe(pts, tf).map((p) => ({
      label: axisDateLabel(p.timestamp), value: p.value,
    })),
    [pts, tf],
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="onchainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.primary} stopOpacity={0.28} />
            <stop offset="100%" stopColor={CHART.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} domain={['auto', 'auto']} tickFormatter={(v: number) => fmtMetric(v)} />
        <Tooltip content={<SeriesTooltip fmt={(v) => fmtMetric(v)} labelMap={{ value: 'Value' }} />} />
        <Area type="monotone" dataKey="value" stroke={CHART.primary} strokeWidth={2} fill="url(#onchainGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── On-chain vs consensus scatter ──────────────────────────────────────────

function OnChainConsensusScatter({ metricId, height = 240 }: { metricId: OnChainMetricId; height?: number }) {
  const chain = useOnChainHistory(metricId).data ?? []
  const acc   = useConsensusAccuracyHistory().data ?? []
  const points = useMemo(() => {
    return chain.map((c, i) => {
      const a = acc[i]
      return a ? { x: Math.round(c.normalized * 100), y: Math.round(a.overallAccuracy * 100) } : null
    }).filter((p): p is { x: number; y: number } => p !== null)
  }, [chain, acc])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 8, right: 8, bottom: 4, left: -8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
        <XAxis type="number" dataKey="x" name="On-chain" domain={[0, 100]} tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
        <YAxis type="number" dataKey="y" name="Accuracy" domain={[0, 100]} width={34} tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
        <ZAxis range={[28, 28]} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<SeriesTooltip fmt={(v) => `${v}%`} labelMap={{ x: 'On-chain', y: 'Accuracy' }} />} />
        <Scatter data={points} fill={CHART.primary} fillOpacity={0.5} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
