'use client'

import { useMemo }              from 'react'
import { useRouter }            from 'next/navigation'
import { cn, formatCurrency }   from '@/lib/utils'
import { MOCK_OPEN_POSITIONS }  from '@/mock/positions'
import { computeAllocationBySegment } from '@/mock/portfolio'
import { getPositionConsensus, ALIGNMENT_LABELS, ALIGNMENT_COLORS } from '@/mock/positionConsensus'
import { ROUTES }               from '@/config/constants'
import type { MouseEvent } from 'react'

interface PortfolioInsightsProps {
  className?: string
}

/**
 * PortfolioInsights
 * ──────────────────
 * Institutional-style "at a glance" summary panel.
 *
 * Surfaces:
 *   - Largest position by value
 *   - Best performing position (highest unrealized P&L%)
 *   - Worst performing position (lowest unrealized P&L%)
 *   - Highest consensus alignment position
 *   - Lowest consensus alignment (most contrarian) position
 *   - Current risk concentration (top segment %)
 */
export function PortfolioInsights({ className }: PortfolioInsightsProps) {
  const router = useRouter()
  const positions = MOCK_OPEN_POSITIONS

  const insights = useMemo(() => {
    if (positions.length === 0) return null

    const largest = [...positions].sort((a, b) => b.currentValue - a.currentValue)[0]!
    const best    = [...positions].sort((a, b) => b.unrealizedPnlPct - a.unrealizedPnlPct)[0]!
    const worst   = [...positions].sort((a, b) => a.unrealizedPnlPct - b.unrealizedPnlPct)[0]!

    const withConsensus = positions
      .map((p) => ({ pos: p, ...getPositionConsensus(p) }))
      .filter((x) => x.consensus !== undefined)

    const highestAligned = [...withConsensus].sort((a, b) => (b.consensus?.score ?? 0) - (a.consensus?.score ?? 0))[0]
    const mostContrarian = withConsensus.find((x) => x.alignment === 'divergent')
      ?? [...withConsensus].sort((a, b) => (a.consensus?.score ?? 1) - (b.consensus?.score ?? 1))[0]

    const allocation = computeAllocationBySegment()
    const topSegment = allocation[0]

    return { largest, best, worst, highestAligned, mostContrarian, topSegment }
  }, [positions])

  if (!insights) {
    return (
      <div className={cn('rounded-xl p-4', className)} style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
        <p className="text-xs" style={{ color: 'var(--probex-text-muted)' }}>No open positions to summarize.</p>
      </div>
    )
  }

  const { largest, best, worst, highestAligned, mostContrarian, topSegment } = insights

  const navigate = (marketId: string) => router.push(`${ROUTES.MARKETS}/${marketId}`)

  return (
    <div className={cn('rounded-xl overflow-hidden', className)} style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>
          Portfolio Insights
        </h2>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

        <InsightRow
          label="Largest Position"
          title={largest.marketTitle}
          value={formatCurrency(largest.currentValue)}
          valueColor="var(--probex-text-primary)"
          onClick={() => navigate(largest.marketId as string)}
        />

        <InsightRow
          label="Best Performer"
          title={best.marketTitle}
          value={`+${(best.unrealizedPnlPct * 100).toFixed(1)}%`}
          valueColor="var(--probex-positive)"
          onClick={() => navigate(best.marketId as string)}
        />

        <InsightRow
          label="Worst Performer"
          title={worst.marketTitle}
          value={`${(worst.unrealizedPnlPct * 100).toFixed(1)}%`}
          valueColor={worst.unrealizedPnlPct < 0 ? 'var(--probex-negative)' : 'var(--probex-positive)'}
          onClick={() => navigate(worst.marketId as string)}
        />

        {highestAligned?.consensus && (
          <InsightRow
            label="Highest Consensus"
            title={highestAligned.pos.marketTitle}
            value={`${Math.round(highestAligned.consensus.score * 100)}%`}
            valueColor="var(--probex-primary)"
            onClick={() => navigate(highestAligned.pos.marketId as string)}
          />
        )}

        {mostContrarian && (
          <InsightRow
            label="Most Contrarian"
            title={mostContrarian.pos.marketTitle}
            value={ALIGNMENT_LABELS[mostContrarian.alignment]}
            valueColor={ALIGNMENT_COLORS[mostContrarian.alignment]}
            onClick={() => navigate(mostContrarian.pos.marketId as string)}
          />
        )}

        {topSegment && (
          <InsightRow
            label="Risk Concentration"
            title={`${topSegment.label} segment`}
            value={`${Math.round(topSegment.pct * 100)}%`}
            valueColor={topSegment.pct > 0.4 ? 'var(--probex-warning)' : 'var(--probex-text-secondary)'}
          />
        )}

      </div>
    </div>
  )
}

// ─── Insight Row ──────────────────────────────────────────────────────────

function InsightRow({
  label, title, value, valueColor, onClick,
}: {
  label: string; title: string; value: string; valueColor: string; onClick?: () => void
}) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        'flex items-center justify-between gap-3 p-2.5 rounded-lg text-left',
        onClick && 'cursor-pointer transition-colors duration-100',
      )}
      style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border)' }}
      {...(onClick ? {
        onMouseEnter: (e: MouseEvent<HTMLElement>) => { e.currentTarget.style.borderColor = 'var(--probex-border-active)' },
        onMouseLeave: (e: MouseEvent<HTMLElement>) => { e.currentTarget.style.borderColor = 'var(--probex-border)' },
      } : {})}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-disabled)' }}>{label}</span>
        <span className="text-xs font-medium truncate" style={{ color: 'var(--probex-text-secondary)' }}>{title}</span>
      </div>
      <span className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color: valueColor }}>{value}</span>
    </Wrapper>
  )
}
