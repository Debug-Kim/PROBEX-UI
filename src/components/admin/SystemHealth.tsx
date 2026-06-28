'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompact } from '@/lib/utils'
import { SERVICE_STATUS, SYSTEM_METRICS, THROUGHPUT_SERIES, type ServiceState, type ServiceStatus } from '@/mock/admin'
import { AdminCard, StatusPill, AdminKpi, type Tone } from './shared'

const STATE_TONE: Record<ServiceState, Tone> = {
  operational: 'positive', degraded: 'warning', down: 'negative',
}

const STATE_LABEL: Record<ServiceState, string> = {
  operational: 'Operational', degraded: 'Degraded', down: 'Outage',
}

export function SystemHealth() {
  const down     = SERVICE_STATUS.filter((s) => s.state === 'down').length
  const degraded = SERVICE_STATUS.filter((s) => s.state === 'degraded').length
  const overallTone: Tone = down > 0 ? 'negative' : degraded > 0 ? 'warning' : 'positive'
  const overallLabel = down > 0 ? 'Partial outage' : degraded > 0 ? 'Degraded performance' : 'All systems operational'

  return (
    <div className="flex flex-col gap-4">
      {/* Overall banner */}
      <div
        className="flex items-center gap-3 rounded-lg px-4 py-3"
        style={{
          background: overallTone === 'positive' ? 'var(--probex-positive-dim)' : overallTone === 'warning' ? 'var(--probex-warning-dim)' : 'var(--probex-negative-dim)',
          border: `1px solid ${overallTone === 'positive' ? 'rgba(16,185,129,0.22)' : overallTone === 'warning' ? 'rgba(245,158,11,0.22)' : 'rgba(239,68,68,0.22)'}`,
        }}
      >
        <span className="w-2.5 h-2.5 rounded-full live-dot" style={{ background: `var(--probex-${overallTone === 'positive' ? 'positive' : overallTone === 'warning' ? 'warning' : 'negative'})` }} aria-hidden="true" />
        <span className="text-sm font-semibold" style={{ color: 'var(--probex-text-primary)' }}>{overallLabel}</span>
        <span className="text-2xs ml-auto" style={{ color: 'var(--probex-text-muted)' }}>Updated just now</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SYSTEM_METRICS.map((m) => (
          <AdminKpi key={m.label} label={m.label} value={m.value} delta={m.delta} tone="info" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Throughput */}
        <AdminCard title="Request Throughput" subtitle="Requests / min · trailing 2 hours">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={THROUGHPUT_SERIES} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: 'var(--probex-text-disabled)' }} tickLine={false} axisLine={false} interval={5} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--probex-text-disabled)' }} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => formatCompact(v)} />
                <Tooltip
                  contentStyle={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--probex-text-muted)' }}
                  formatter={(v: number) => [formatCompact(v), 'req/min']}
                />
                <Line type="monotone" dataKey="rpm" stroke="var(--probex-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        {/* Services */}
        <AdminCard title="Service Status" subtitle={`${SERVICE_STATUS.length} services monitored`} noPadding>
          <ul>
            {SERVICE_STATUS.map((s, i) => (
              <ServiceRow key={s.name} svc={s} first={i === 0} />
            ))}
          </ul>
        </AdminCard>
      </div>
    </div>
  )
}

function ServiceRow({ svc, first }: { svc: ServiceStatus; first: boolean }) {
  return (
    <li
      className="px-4 py-3 flex items-center gap-3"
      style={{ borderTop: first ? 'none' : '1px solid var(--probex-border)' }}
    >
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium" style={{ color: 'var(--probex-text-primary)' }}>{svc.name}</span>
        <span className="text-2xs tabular-nums" style={{ color: 'var(--probex-text-muted)' }}>
          {svc.state === 'down' ? 'No response' : `${svc.latencyMs}ms`} · {(svc.uptime * 100).toFixed(2)}% uptime
        </span>
      </div>
      <StatusPill tone={STATE_TONE[svc.state]}>{STATE_LABEL[svc.state]}</StatusPill>
    </li>
  )
}
