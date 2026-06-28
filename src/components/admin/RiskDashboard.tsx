'use client'

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatRelativeTime } from '@/lib/utils'
import { EXPOSURE_SERIES, RISK_ALERTS, RISK_METRICS, type RiskAlert, type RiskMetric } from '@/mock/admin'
import { AdminCard, StatusPill, type Tone } from './shared'

const LEVEL_TONE: Record<RiskMetric['level'], Tone> = {
  ok: 'positive', elevated: 'warning', critical: 'negative',
}

const SEVERITY_TONE: Record<RiskAlert['severity'], Tone> = {
  info: 'info', warning: 'warning', critical: 'negative',
}

export function RiskDashboard() {
  return (
    <div className="flex flex-col gap-4">
      {/* Risk metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {RISK_METRICS.map((m) => (
          <div
            key={m.label}
            className="rounded-xl p-4 flex flex-col gap-2"
            style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-text-muted)' }}>{m.label}</span>
              <StatusPill tone={LEVEL_TONE[m.level]}>{m.level}</StatusPill>
            </div>
            <span className="text-2xl font-bold tabular-nums leading-none" style={{ color: 'var(--probex-text-primary)' }}>{m.value}</span>
            <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>{m.hint}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Exposure trend */}
        <AdminCard title="Platform Exposure" subtitle="Net open liability · trailing 14 days ($M)">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EXPOSURE_SERIES} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--probex-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--probex-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--probex-text-disabled)' }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--probex-text-disabled)' }} tickLine={false} axisLine={false} width={40} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip
                  contentStyle={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--probex-text-muted)' }}
                  formatter={(v: number) => [`$${v}M`, 'Exposure']}
                />
                <Area type="monotone" dataKey="exposure" stroke="var(--probex-primary)" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        {/* Active alerts */}
        <AdminCard title="Active Risk Alerts" subtitle={`${RISK_ALERTS.length} open`} noPadding>
          <ul className="divide-y" style={{ borderColor: 'var(--probex-border)' }}>
            {RISK_ALERTS.map((a) => (
              <li key={a.id} className="px-4 py-3 flex items-start gap-3" style={{ borderTop: a.id === RISK_ALERTS[0]!.id ? 'none' : undefined }}>
                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{
                  background: a.severity === 'critical' ? 'var(--probex-negative)' : 'var(--probex-warning)',
                }} aria-hidden="true" />
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-xs font-semibold" style={{ color: 'var(--probex-text-primary)' }}>{a.type}</span>
                    <StatusPill tone={SEVERITY_TONE[a.severity]} dot={false}>{a.severity}</StatusPill>
                  </div>
                  <span className="text-2xs" style={{ color: 'var(--probex-text-secondary)' }}>{a.detail}</span>
                  <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>{a.market} · {formatRelativeTime(a.at)}</span>
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </div>
  )
}
