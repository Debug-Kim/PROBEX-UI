'use client'

// Probability/consensus/volume charts. Keeps the full historical series from
// mock/marketHistory.ts and appends bounded live points (MAX_LIVE_POINTS) from the
// `liveView` prop so the right edge advances in real time. With liveView null
// (flag off) it renders identically to the static charts.

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useMarketStore } from '@/store'
import { getProbabilityHistory, getConsensusHistory, getVolumeHistory } from '@/mock/marketHistory'
import { LiveIndicator } from '@/components/live/LiveIndicator'
import { TimeframeSelector } from '@/components/charts/TimeframeSelector'
import type { Market } from '@/types/market'
import type { MergedMarketView } from '@/lib/realtime/types'

const MAX_LIVE_POINTS = 120   // 30 seconds at 4 Hz

interface LiveDataPoint {
  ts: number
  probability?: number
  consensusScore?: number
  volume?: number
}

interface MarketChartsProps {
  market: Market
 liveView?: MergedMarketView | null
}

// Format tick timestamp to "HH:MM" for live points, "MMM DD" for historical
function formatTs(ts: number, isLive: boolean): string {
  const d = new Date(ts)
  if (isLive) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// Custom tooltip using CSS vars
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; color: string; name: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        backgroundColor: 'var(--probex-surface-2)',
        border: '1px solid var(--probex-border)',
        borderRadius: 6,
        padding: '8px 12px',
        fontSize: 12,
      }}
    >
      <p style={{ color: 'var(--probex-text-muted)', margin: '0 0 4px' }}>
        {label}
      </p>
      {payload.map((p) => (
        <p
          key={p.name}
          style={{ color: p.color, margin: '2px 0', fontWeight: 600 }}
        >
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  )
}

export function MarketCharts({ market, liveView }: MarketChartsProps) {
  const timeframe = useMarketStore((s) => s.activeTimeframe)
  const isLiveActive = liveView?.isLive ?? false

  // ── Historical series (memoised; only changes with timeframe) ─────────────
  const historicalProb = useMemo(
    () => getProbabilityHistory(market.id, timeframe),
    [market.id, timeframe],
  )
  const historicalConsensus = useMemo(
    () => getConsensusHistory(market.id, timeframe),
    [market.id, timeframe],
  )
  const historicalVolume = useMemo(
    () => getVolumeHistory(market.id, timeframe),
    [market.id, timeframe],
  )

 // ── Live point buffers ──────────────────────────────────────────
  const [livePoints, setLivePoints] = useState<LiveDataPoint[]>([])
  const prevTickTs = useRef<number | null>(null)

  useEffect(() => {
    if (!liveView || !liveView.isLive || !liveView.lastTickAt) return
    // Only append when timestamp advances (dedup re-renders that don't carry a new tick)
    if (liveView.lastTickAt === prevTickTs.current) return
    prevTickTs.current = liveView.lastTickAt

    setLivePoints((prev) => {
      const next: LiveDataPoint = {
        ts: liveView.lastTickAt!,
        probability: liveView.probability,
        consensusScore: liveView.consensusScore,
        // volume is cumulative; show delta relative to last live point
        volume:
          prev.length > 0
            ? liveView.volume - (prev[0]?.volume ?? 0)   // delta from first live point baseline
            : 0,
      }
      const updated = [next, ...prev].slice(0, MAX_LIVE_POINTS)
      return updated
    })
  }, [liveView])

  // Reset live points when timeframe changes or market changes
  useEffect(() => {
    setLivePoints([])
    prevTickTs.current = null
  }, [market.id, timeframe])

  // ── Merge historical + live for each chart ────────────────────────────────
  // Live points are prepended (newer) so array is [newest...oldest] →
  // reverse for chart display so time flows left→right
  const probData = useMemo(() => {
    const historical = historicalProb.map((p) => ({
      ts: p.ts,
      label: formatTs(p.ts, false),
      probability: p.probability,
      isLive: false,
    }))
    const live = [...livePoints].reverse().map((p) => ({
      ts: p.ts,
      label: formatTs(p.ts, true),
      probability: p.probability ?? null,
      isLive: true,
    }))
    return [...historical, ...live]
  }, [historicalProb, livePoints])

  const consensusData = useMemo(() => {
    // Consensus scores are 0–1 fractions; the chart YAxis is 0–100, so scale to
    // percentage points to match the axis and the "Consensus Score" header.
    const historical = historicalConsensus.map((p) => ({
      ts: p.ts,
      label: formatTs(p.ts, false),
      score: Math.round(p.score * 100),
      isLive: false,
    }))
    const live = [...livePoints].reverse().map((p) => ({
      ts: p.ts,
      label: formatTs(p.ts, true),
      score: p.consensusScore != null ? Math.round(p.consensusScore * 100) : null,
      isLive: true,
    }))
    return [...historical, ...live]
  }, [historicalConsensus, livePoints])

  const volumeData = useMemo(() => {
    const historical = historicalVolume.map((p) => ({
      ts: p.ts,
      label: formatTs(p.ts, false),
      volume: p.volume,
      isLive: false,
    }))
    const live = [...livePoints].reverse().map((p) => ({
      ts: p.ts,
      label: formatTs(p.ts, true),
      volume: p.volume ?? null,
      isLive: true,
    }))
    return [...historical, ...live]
  }, [historicalVolume, livePoints])

  // ── Shared chart config ───────────────────────────────────────────────────
  const axisStyle = {
    fontSize: 10,
    fill: 'var(--probex-text-muted)',
    fontFamily: 'inherit',
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Controls row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <TimeframeSelector />
 {isLiveActive && <LiveIndicator variant="pill" />}
      </div>

      {/* ── Probability chart ─────────────────────────────────────────────── */}
      <section aria-label="Probability chart">
        <ChartHeader label="Probability" value={`${(liveView?.probability ?? market.probability).toFixed(1)}%`} isLive={isLiveActive} />
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={probData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--probex-primary)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--probex-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--probex-border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
              width={32}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={50} stroke="var(--probex-border-active)" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="probability"
              name="Probability"
              stroke="var(--probex-primary)"
              fill="url(#probGradient)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* ── Consensus chart ───────────────────────────────────────────────── */}
      <section aria-label="Consensus chart">
        <ChartHeader label="Consensus Score" value={((liveView?.consensusScore ?? 0.5) * 100).toFixed(0)} isLive={isLiveActive} />
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={consensusData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--probex-border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={50} stroke="var(--probex-border-active)" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="score"
              name="Consensus"
              stroke="var(--probex-consensus-high)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* ── Volume chart ──────────────────────────────────────────────────── */}
      <section aria-label="Volume chart">
        <ChartHeader label="Volume" value={formatVolume(liveView?.volume ?? market.volume)} isLive={isLiveActive} />
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={volumeData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--probex-border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatVolume}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="volume"
              name="Volume"
              fill="var(--probex-primary)"
              opacity={0.6}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function ChartHeader({
  label,
  value,
  isLive,
}: {
  label: string
  value: string
  isLive: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 8,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--probex-text-muted)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--probex-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      {isLive && (
        <LiveIndicator variant="dot" />
      )}
    </div>
  )
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(Math.round(v))
}
