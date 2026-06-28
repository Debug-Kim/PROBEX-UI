'use client'

/** Analytics Overview — composition root: a cross-domain summary plus each domain panel. */

import { cn, formatPercent, formatDelta, formatCompact } from '@/lib/utils'
import { useAnalyticsStore, useAnalyticsViewMode } from '@/store/analyticsStore'
import { ANALYTICS_DASHBOARD, SEGMENT_ANALYTICS } from '@/mock/analytics'
import { getSegmentMeta } from '@/config/marketSegments'
import { StatCard } from '@/components/ui/StatCard'
import { AnalyticsCard } from './shared'
import { AnalyticsFilters } from './AnalyticsFilters'
import { ConsensusAnalytics, ConsensusAccuracyChart, SignalPerformanceTable } from './ConsensusAnalytics'
import { ETFAnalytics, ETFFlowChart } from './ETFAnalytics'
import { InstitutionalAnalytics } from './InstitutionalAnalytics'
import { OnChainAnalytics } from './OnChainAnalytics'
import { MarketAnalytics } from './MarketAnalytics'
import { PortfolioAnalytics } from './PortfolioAnalytics'
import type { AnalyticsDashboard, SegmentPerformanceRecord } from '@/types/analytics'

interface AnalyticsOverviewProps {
  data?:      AnalyticsDashboard
  className?: string
}

const TABS = [
  { id: 'overview',      label: 'Overview'       },
  { id: 'consensus',     label: 'Consensus'      },
  { id: 'institutional', label: 'Institutional'  },
  { id: 'etf',           label: 'ETF Flows'      },
  { id: 'on-chain',      label: 'On-Chain'       },
  { id: 'market',        label: 'Market'         },
  { id: 'portfolio',     label: 'Portfolio'      },
] as const

export function AnalyticsOverview({ data, className }: AnalyticsOverviewProps) {
  const { activeTab, setTab } = useAnalyticsStore()
  const viewMode = useAnalyticsViewMode()
  const dash     = data ?? ANALYTICS_DASHBOARD

  return (
    <div className={cn('page-container flex flex-col gap-4 pb-8', className)}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--probex-text-primary)' }}>Analytics</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--probex-text-muted)' }}>
            Bitcoin intelligence · Consensus-powered signal analytics
          </p>
        </div>
        <span
          className="text-2xs px-2.5 py-1 rounded-md font-semibold"
          style={{ background: 'var(--probex-primary-dim)', color: 'var(--probex-primary)', border: '1px solid var(--probex-yes-border)' }}
        >
          {viewMode.toUpperCase().replace('-', ' ')}
        </span>
      </div>

      {/* Filters */}
      <AnalyticsFilters />

      {/* Tab nav */}
      <nav className="flex border-b overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--probex-border)' }} role="tablist" aria-label="Analytics domains">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setTab(tab.id)}
            className="text-xs font-semibold px-4 py-2.5 cursor-pointer transition-colors duration-100 whitespace-nowrap"
            style={{
              color:        activeTab === tab.id ? 'var(--probex-primary)' : 'var(--probex-text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--probex-primary)' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab panels */}
      <div role="tabpanel">
        {activeTab === 'overview'      && <OverviewTab dash={dash} />}
        {activeTab === 'consensus'     && <ConsensusAnalytics     summary={dash.consensusSummary} />}
        {activeTab === 'institutional' && <InstitutionalAnalytics summary={dash.institutionalSummary} />}
        {activeTab === 'etf'           && <ETFAnalytics           summary={dash.etfSummary} />}
        {activeTab === 'on-chain'      && <OnChainAnalytics       summary={dash.onChainSummary} />}
        {activeTab === 'market'        && <MarketAnalytics        segments={SEGMENT_ANALYTICS} />}
        {activeTab === 'portfolio'     && <PortfolioAnalytics     summary={dash.portfolioSummary} />}
      </div>
    </div>
  )
}

// ─── Overview tab ───────────────────────────────────────────────────────────

function OverviewTab({ dash }: { dash: AnalyticsDashboard }) {
  const c = dash.consensusSummary
  const e = dash.etfSummary
  const i = dash.institutionalSummary
  const o = dash.onChainSummary
  const p = dash.portfolioSummary

  return (
    <div className="flex flex-col gap-4">
      {/* Headline stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Consensus Accuracy" value={formatPercent(c.avgAccuracy)}  valueColor="var(--probex-primary)" />
        <StatCard label="Strong Signals"     value={formatPercent(c.strongSignalPct)} valueColor="var(--probex-positive)" />
        <StatCard label="ETF Net Inflow"     value={`$${(e.totalNetInflow / 1000).toFixed(1)}B`} valueColor="var(--probex-positive)" />
        <StatCard label="Inst. Net Flow"     value={`$${formatCompact(i.netFlow)}`} valueColor="var(--probex-chart-secondary)" />
        <StatCard label="On-Chain Signal"    value={o.overallSignal} valueColor="var(--probex-positive)" deltaLabel={`r ≈ ${o.consensusCorr.toFixed(2)}`} />
        <StatCard label="Portfolio Return"   value={formatDelta(p.totalReturnPct)} valueColor={p.totalReturnPct >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)'} />
      </div>

      {/* Primary charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <AnalyticsCard className="lg:col-span-2" title="Consensus Accuracy" subtitle="Overall vs institutional vs retail">
          <ConsensusAccuracyChart height={220} />
        </AnalyticsCard>
        <AnalyticsCard title="ETF Net Flow" subtitle="Daily flow + cumulative AUM">
          <ETFFlowChart height={220} />
        </AnalyticsCard>
      </div>

      {/* Segment heatmap + signal table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AnalyticsCard title="Segment Performance" subtitle="Consensus accuracy across all 8 segments">
          <SegmentHeatmap segments={SEGMENT_ANALYTICS} />
        </AnalyticsCard>
        <AnalyticsCard title="Signal Performance" subtitle="Win rate and return by signal level">
          <SignalPerformanceTable />
        </AnalyticsCard>
      </div>
    </div>
  )
}

// ─── Segment heatmap ────────────────────────────────────────────────────────

function accuracyColor(acc: number): string {
  if (acc >= 0.65) return 'var(--probex-positive)'
  if (acc >= 0.55) return 'var(--probex-primary)'
  if (acc >= 0.50) return 'var(--probex-warning)'
  return 'var(--probex-negative)'
}

function SegmentHeatmap({ segments }: { segments: SegmentPerformanceRecord[] }) {
  const sorted = [...segments].sort((a, b) => b.avgAccuracy - a.avgAccuracy)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {sorted.map((s) => {
        const color   = accuracyColor(s.avgAccuracy)
        const intensity = Math.round(12 + s.avgAccuracy * 28)
        return (
          <div
            key={s.segment}
            className="flex flex-col gap-1 p-3 rounded-lg"
            style={{ background: `color-mix(in srgb, ${color} ${intensity}%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}
            title={getSegmentMeta(s.segment).label}
          >
            <span className="text-2xs font-semibold uppercase tracking-wider truncate" style={{ color: 'var(--probex-text-secondary)' }}>
              {getSegmentMeta(s.segment).shortLabel}
            </span>
            <span className="text-lg font-bold tabular-nums leading-none" style={{ color }}>{formatPercent(s.avgAccuracy)}</span>
            <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>{s.marketCount} markets</span>
          </div>
        )
      })}
    </div>
  )
}
