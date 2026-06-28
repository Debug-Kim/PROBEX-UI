'use client'

import { useMemo }              from 'react'
import { cn, formatCurrency }   from '@/lib/utils'
import { ExposureChart }        from './charts/ExposureChart'
import { MOCK_OPEN_POSITIONS }  from '@/mock/positions'
import { getPositionConsensus, ALIGNMENT_LABELS, ALIGNMENT_COLORS } from '@/mock/positionConsensus'

interface PortfolioAllocationProps {
  className?: string
}

/**
 * PortfolioAllocation
 * ────────────────────
 * Three-way allocation breakdown:
 *   1. By Segment    — ExposureChart donut (existing)
 *   2. By Side       — YES vs NO exposure
 *   3. By Consensus Category — aligned / neutral / divergent
 *
 * This is where "where is risk concentrated?" is answered.
 */
export function PortfolioAllocation({ className }: PortfolioAllocationProps) {
  const positions = MOCK_OPEN_POSITIONS
  const total      = positions.reduce((s, p) => s + p.currentValue, 0)

  // ── By side ──────────────────────────────────────────────────────────
  const bySide = useMemo(() => {
    const yes = positions.filter((p) => p.side === 'yes')
    const no  = positions.filter((p) => p.side === 'no')
    const yesValue = yes.reduce((s, p) => s + p.currentValue, 0)
    const noValue  = no.reduce((s, p) => s + p.currentValue, 0)
    const yesPnl   = yes.reduce((s, p) => s + p.unrealizedPnl, 0)
    const noPnl    = no.reduce((s, p) => s + p.unrealizedPnl, 0)
    return { yes: { count: yes.length, value: yesValue, pnl: yesPnl }, no: { count: no.length, value: noValue, pnl: noPnl } }
  }, [positions])

  // ── By consensus category ───────────────────────────────────────────
  const byConsensus = useMemo(() => {
    const buckets: Record<string, { count: number; value: number; pnl: number }> = {
      aligned: { count: 0, value: 0, pnl: 0 },
      neutral: { count: 0, value: 0, pnl: 0 },
      divergent: { count: 0, value: 0, pnl: 0 },
      unknown: { count: 0, value: 0, pnl: 0 },
    }
    for (const pos of positions) {
      const { alignment } = getPositionConsensus(pos)
      const bucket = buckets[alignment]
      if (bucket) {
        bucket.count += 1
        bucket.value += pos.currentValue
        bucket.pnl   += pos.unrealizedPnl
      }
    }
    return buckets
  }, [positions])

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-3', className)}>

      {/* ── By Segment (donut) ──────────────────────────────────────── */}
      <div className="rounded-xl p-4" style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--probex-text-primary)' }}>
          By Segment
        </h3>
        <ExposureChart height={200} />
      </div>

      {/* ── By Side ──────────────────────────────────────────────────── */}
      <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>
          By Position Side
        </h3>

        {/* Stacked bar */}
        <div className="flex h-3 rounded-full overflow-hidden" style={{ background: 'var(--probex-border-default)' }}>
          <div className="h-full" style={{ width: `${(bySide.yes.value / total) * 100}%`, background: 'var(--probex-yes)' }} />
          <div className="h-full" style={{ width: `${(bySide.no.value / total) * 100}%`, background: 'var(--probex-no)' }} />
        </div>

        <div className="flex flex-col gap-2.5 mt-1">
          <SideRow label="YES" color="var(--probex-yes)" count={bySide.yes.count} value={bySide.yes.value} pnl={bySide.yes.pnl} total={total} />
          <SideRow label="NO"  color="var(--probex-no)"  count={bySide.no.count}  value={bySide.no.value}  pnl={bySide.no.pnl}  total={total} />
        </div>

        <p className="text-2xs leading-relaxed mt-1" style={{ color: 'var(--probex-text-disabled)' }}>
          {bySide.yes.value > bySide.no.value
            ? 'Portfolio is net long — majority of exposure backs YES outcomes.'
            : 'Portfolio is net short — majority of exposure backs NO outcomes.'}
        </p>
      </div>

      {/* ── By Consensus Category ────────────────────────────────────── */}
      <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--probex-primary)' }}>
          <span className="live-dot w-1.5 h-1.5" aria-hidden="true" />
          By Consensus Category
        </h3>

        <div className="flex flex-col gap-2.5">
          {(['aligned', 'neutral', 'divergent'] as const).map((cat) => {
            const bucket = byConsensus[cat]
            if (!bucket) return null
            const pct = total > 0 ? bucket.value / total : 0
            return (
              <div key={cat} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: ALIGNMENT_COLORS[cat] }} className="font-semibold">
                    {ALIGNMENT_LABELS[cat]}
                  </span>
                  <span style={{ color: 'var(--probex-text-secondary)' }}>
                    {bucket.count} pos · {formatCurrency(bucket.value)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--probex-border-default)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: ALIGNMENT_COLORS[cat] }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

// ─── Side Row ─────────────────────────────────────────────────────────────

function SideRow({
  label, color, count, value, pnl, total,
}: {
  label: string; color: string; count: number; value: number; pnl: number; total: number
}) {
  const pct = total > 0 ? (value / total) * 100 : 0
  const isProfit = pnl >= 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xs font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: color, color: label === 'YES' ? '#050816' : '#fff' }}>
        {label}
      </span>
      <span className="text-xs flex-1" style={{ color: 'var(--probex-text-secondary)' }}>
        {count} positions · {formatCurrency(value)}
      </span>
      <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--probex-text-primary)' }}>
        {pct.toFixed(0)}%
      </span>
      <span className="text-xs font-semibold tabular-nums w-16 text-right" style={{ color: isProfit ? 'var(--probex-positive)' : 'var(--probex-negative)' }}>
        {isProfit ? '+' : ''}{formatCurrency(pnl)}
      </span>
    </div>
  )
}
