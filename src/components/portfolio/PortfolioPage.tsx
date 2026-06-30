'use client'

import Link                      from 'next/link'
import { cn }                    from '@/lib/utils'
import { usePositions }          from '@/hooks/useServices'
import { PortfolioOverview }     from './PortfolioOverview'
import { PortfolioAllocation }   from './PortfolioAllocation'
import { PortfolioInsights }     from './PortfolioInsights'
import { ConsensusPerformance }  from './ConsensusPerformance'
import { PortfolioActivity }     from './PortfolioActivity'
import { PortfolioValueChart }   from './charts/PortfolioValueChart'
import { PnLChart }              from './charts/PnLChart'
import { WinRateChart }          from './charts/WinRateChart'
import { PortfolioTimeframeSelector } from './charts/PortfolioTimeframeSelector'
import { OpenPositions }         from '@/components/positions/OpenPositions'
import { SettledPositions }      from '@/components/positions/SettledPositions'
import { EmptyState }            from '@/components/ui/EmptyState'
import { ROUTES }                from '@/config/constants'
import type { ReactNode } from 'react'

interface PortfolioPageProps {
  className?: string
}

/**
 * PortfolioPage
 * ─────────────
 * Master assembly of the complete Portfolio experience.
 *
 * Section order (top → bottom):
 *   1. PortfolioOverview     — metrics + exposure + consensus alignment + performance snapshot
 *   2. Performance Charts    — value, P&L, win rate (timeframe-synced via marketStore-style selector)
 *   3. PortfolioAllocation   — segment / side / consensus category breakdown
 *   4. PortfolioInsights + ConsensusPerformance — institutional summary row
 *   5. OpenPositions          — filterable table + detail panel
 *   6. SettledPositions       — resolved positions + consensus accuracy
 *   7. PortfolioActivity      — account activity feed
 *
 * Empty state: if the user has zero positions (open AND settled),
 * the entire positions/performance section is replaced with an
 * EmptyState directing them to Markets.
 */
export function PortfolioPage({ className }: PortfolioPageProps) {
  const openPositions    = usePositions('open').data ?? []
  const settledPositions = usePositions('settled').data ?? []
  const hasAnyPositions  = openPositions.length > 0 || settledPositions.length > 0

  return (
    <div className={cn('page-container flex flex-col gap-5 pb-8', className)}>

      {/* ── Page title ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--probex-text-primary)' }}>
            Portfolio
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--probex-text-muted)' }}>
            Performance, exposure, and Consensus Engine alignment
          </p>
        </div>
      </div>

      {/* ── 1. Overview ────────────────────────────────────────────── */}
      <PortfolioOverview />

      {hasAnyPositions ? (
        <>
          {/* ── 2. Performance Charts ───────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold" style={{ color: 'var(--probex-text-primary)' }}>
                Performance
              </h2>
              <PortfolioTimeframeSelector />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <ChartCard title="Portfolio Value">
                <PortfolioValueChart height={200} />
              </ChartCard>
              <ChartCard title="Daily &amp; Cumulative P&amp;L">
                <PnLChart height={200} />
              </ChartCard>
              <ChartCard title="Rolling Win Rate" className="lg:col-span-2">
                <WinRateChart height={160} />
              </ChartCard>
            </div>
          </section>

          {/* ── 3. Allocation ────────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-bold" style={{ color: 'var(--probex-text-primary)' }}>
              Allocation
            </h2>
            <PortfolioAllocation />
          </section>

          {/* ── 4. Insights + Consensus Performance ─────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <PortfolioInsights />
            <ConsensusPerformance />
          </section>

          {/* ── 5. Open Positions ────────────────────────────────────── */}
          <OpenPositions />

          {/* ── 6. Settled Positions ─────────────────────────────────── */}
          <SettledPositions />

          {/* ── 7. Activity ──────────────────────────────────────────── */}
          <PortfolioActivity />
        </>
      ) : (
        <EmptyState
          title="No positions yet"
          description="Open a position in any Bitcoin market to start tracking performance and consensus alignment here."
          action={
            <Link href={ROUTES.MARKETS} className="btn-primary px-5 py-2 text-sm inline-flex">
              Browse Markets
            </Link>
          }
        />
      )}

    </div>
  )
}

// ─── Chart Card wrapper ─────────────────────────────────────────────────

function ChartCard({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl p-4', className)} style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--probex-text-muted)' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}
