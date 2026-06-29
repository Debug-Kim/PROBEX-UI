'use client'

// How the engine's prediction confidence has evolved, with an uncertainty band.
// Reuses the analytics card + tooltip primitives for visual consistency.

import { useMemo } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { AnalyticsCard, SeriesTooltip, CHART, AXIS_TICK, axisDateLabel } from '@/components/analytics/shared'
import { getConfidenceEvolution } from '@/mock/intelligence'

export function ConfidenceEvolution({ marketId, baseConfidence }: { marketId: string; baseConfidence: number }) {
  const data = useMemo(
    () => getConfidenceEvolution(marketId, baseConfidence).map((p) => ({
      label: axisDateLabel(p.timestamp), confidence: p.confidence, upper: p.upper, lower: p.lower,
    })),
    [marketId, baseConfidence],
  )

  return (
    <AnalyticsCard title="Confidence Evolution" subtitle="Prediction confidence over time with uncertainty band">
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.primary} stopOpacity={0.28} />
              <stop offset="100%" stopColor={CHART.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
          <YAxis domain={[0, 100]} tick={AXIS_TICK} tickLine={false} axisLine={false} width={34} tickFormatter={(v: number) => `${v}%`} />
          <Tooltip content={<SeriesTooltip fmt={(v) => `${v}%`} labelMap={{ confidence: 'Confidence', upper: 'Upper', lower: 'Lower' }} />} />
          <Line type="monotone" dataKey="upper" stroke={CHART.muted} strokeWidth={1} strokeDasharray="3 3" dot={false} />
          <Line type="monotone" dataKey="lower" stroke={CHART.muted} strokeWidth={1} strokeDasharray="3 3" dot={false} />
          <Area type="monotone" dataKey="confidence" stroke={CHART.primary} strokeWidth={2} fill="url(#confGrad)" />
        </ComposedChart>
      </ResponsiveContainer>
    </AnalyticsCard>
  )
}
