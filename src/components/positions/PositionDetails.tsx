'use client'

import { useRouter }            from 'next/navigation'
import { cn, formatCurrency, formatRelativeTime, formatBias } from '@/lib/utils'
import { ALIGNMENT_LABELS, ALIGNMENT_COLORS } from '@/lib/positions/alignment'
import { usePositions, usePositionConsensus } from '@/hooks/useServices'
import { usePortfolioStore, useSelectedPositionId, useIsDetailPanelOpen } from '@/store/portfolioStore'
import { ConsensusBadge }        from '@/components/markets/ConsensusBadge'
import { ConfidenceMeter }       from '@/components/markets/ConfidenceMeter'
import { ROUTES }                from '@/config/constants'
import type { ReactNode } from 'react'

/**
 * PositionDetails
 * ───────────────
 * Slide-over / inline detail panel for a single position.
 * Renders null when no position is selected or panel is closed.
 *
 * Sections:
 *   1. Position Summary  — side, contracts, entry/current, stake/value
 *   2. Market Summary     — title, segment, status, link to market
 *   3. Consensus Snapshot — score, bias, confidence at a glance
 *   4. Entry Thesis        — mock narrative on why this position was opened
 *   5. Current Performance — P&L, return %, alignment verdict
 */
export function PositionDetails({ className }: { className?: string }) {
  const router             = useRouter()
  const selectedId         = useSelectedPositionId()
  const isOpen             = useIsDetailPanelOpen()
  const closeDetailPanel   = usePortfolioStore((s) => s.closeDetailPanel)
  const allPositions       = usePositions('all').data ?? []
  const positionConsensus  = usePositionConsensus()

  if (!isOpen || !selectedId) return null

  const position = allPositions.find((p) => (p.id as string) === selectedId)
  if (!position) return null

  const { consensus, alignment } = positionConsensus(position)
  const isYes      = position.side === 'yes'
  const sideColor  = isYes ? 'var(--probex-yes)' : 'var(--probex-no)'
  const isProfit   = position.unrealizedPnl >= 0
  const pnlColor   = isProfit ? 'var(--probex-positive)' : 'var(--probex-negative)'
  const isSettled  = position.status !== 'open'

  const thesis = generateEntryThesis(position, consensus)

  return (
    <div
      className={cn('rounded-xl overflow-hidden animate-fade-in-up', className)}
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border-default)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="text-2xs font-black uppercase tracking-widest px-2 py-0.5 rounded flex-shrink-0"
            style={{ background: sideColor, color: isYes ? '#050816' : '#fff' }}
          >
            {position.side.toUpperCase()}
          </span>
          <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--probex-text-primary)' }}>
            {position.marketTitle}
          </h2>
        </div>
        <button
          onClick={closeDetailPanel}
          className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors duration-100"
          style={{ color: 'var(--probex-text-muted)' }}
          aria-label="Close position details"
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--probex-text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--probex-text-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* ── Position Summary ─────────────────────────────────── */}
        <section>
          <SectionLabel>Position Summary</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MetricCell label="Contracts" value={position.contracts.toLocaleString()} />
            <MetricCell label="Entry Price" value={`${position.entryPrice}¢`} />
            <MetricCell label={isSettled ? 'Settle Price' : 'Current Price'} value={`${position.currentPrice}¢`} valueColor={sideColor} />
            <MetricCell label="Stake" value={formatCurrency(position.costBasis)} />
            <MetricCell label={isSettled ? 'Payout' : 'Current Value'} value={formatCurrency(position.currentValue)} />
            <MetricCell label={isSettled ? 'Realized P&L' : 'Unrealized P&L'} value={`${isProfit ? '+' : ''}${formatCurrency(position.unrealizedPnl)}`} valueColor={pnlColor} />
            <MetricCell label="Return" value={`${isProfit ? '+' : ''}${(position.unrealizedPnlPct * 100).toFixed(1)}%`} valueColor={pnlColor} />
            <MetricCell label="Opened" value={formatRelativeTime(position.openedAt)} />
          </div>
        </section>

        {/* ── Market Summary ───────────────────────────────────── */}
        <section>
          <SectionLabel>Market</SectionLabel>
          <button
            onClick={() => router.push(`${ROUTES.MARKETS}/${position.marketId}`)}
            className="w-full flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-100 text-left"
            style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border)' }}
          >
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-sm font-medium truncate" style={{ color: 'var(--probex-text-primary)' }}>
                {position.marketTitle}
              </span>
              <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>
                {formatSegment(position.segment)} · {isSettled ? 'Resolved' : 'Live'}
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0" style={{ color: 'var(--probex-text-muted)' }} aria-hidden="true">
              <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
            </svg>
          </button>
        </section>

        {/* ── Consensus Snapshot ───────────────────────────────── */}
        {consensus && (
          <section>
            <SectionLabel>Consensus Snapshot</SectionLabel>
            <div className="rounded-lg p-3 flex flex-col gap-2.5" style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border)' }}>
              <div className="flex items-center justify-between">
                <ConsensusBadge score={consensus.score} size="sm" />
                <ConfidenceMeter confidence={{ high: 0.85, medium: 0.5, low: 0.25 }[consensus.confidence] ?? 0.5} size="sm" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span style={{ color: 'var(--probex-text-disabled)' }}>Institutional Bias</span>
                  <span className="font-semibold" style={{ color: biasColorOf(consensus.institutionalBias) }}>
                    {formatBias(consensus.institutionalBias)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span style={{ color: 'var(--probex-text-disabled)' }}>Retail Bias</span>
                  <span className="font-semibold" style={{ color: biasColorOf(consensus.retailBias) }}>
                    {formatBias(consensus.retailBias)}
                  </span>
                </div>
              </div>
              {/* Alignment verdict */}
              <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid var(--probex-border)' }}>
                <span className="text-xs" style={{ color: 'var(--probex-text-muted)' }}>Your position is</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ background: `color-mix(in srgb, ${ALIGNMENT_COLORS[alignment]} 12%, transparent)`, color: ALIGNMENT_COLORS[alignment] }}
                >
                  {ALIGNMENT_LABELS[alignment]}
                </span>
                <span className="text-xs" style={{ color: 'var(--probex-text-muted)' }}>with the engine</span>
              </div>
            </div>
          </section>
        )}

        {/* ── Entry Thesis ──────────────────────────────────────── */}
        <section>
          <SectionLabel>Entry Thesis</SectionLabel>
          <p
            className="text-sm leading-relaxed p-3 rounded-lg"
            style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border)', color: 'var(--probex-text-secondary)', fontStyle: 'italic' }}
          >
            &ldquo;{thesis}&rdquo;
          </p>
        </section>

        {/* ── Current Performance ───────────────────────────────── */}
        <section>
          <SectionLabel>Current Performance</SectionLabel>
          <div className="flex flex-col gap-1.5">
            <PerformanceBar label="Probability Move" from={position.entryPrice} to={position.currentPrice} color={sideColor} />
            <div className="flex items-center justify-between text-xs pt-1">
              <span style={{ color: 'var(--probex-text-muted)' }}>
                {isSettled ? 'Final outcome' : 'If resolved now'}
              </span>
              <span className="font-semibold" style={{ color: pnlColor }}>
                {isProfit ? '+' : ''}{formatCurrency(position.unrealizedPnl)} ({isProfit ? '+' : ''}{(position.unrealizedPnlPct * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-2xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--probex-text-muted)' }}>
      {children}
    </h3>
  )
}

function MetricCell({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-2 rounded-lg" style={{ background: 'var(--probex-surface-2)' }}>
      <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>{label}</span>
      <span className="text-sm font-bold tabular-nums" style={{ color: valueColor ?? 'var(--probex-text-primary)' }}>{value}</span>
    </div>
  )
}

function PerformanceBar({ label, from, to, color }: { label: string; from: number; to: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: 'var(--probex-text-muted)' }}>{label}</span>
        <span className="font-semibold tabular-nums" style={{ color: 'var(--probex-text-secondary)' }}>
          {from}¢ → <span style={{ color }}>{to}¢</span>
        </span>
      </div>
      <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--probex-border-default)' }}>
        <div className="absolute h-full rounded-full" style={{ width: `${Math.max(from, to)}%`, background: `${color}33` }} />
        <div className="absolute h-full rounded-full" style={{ width: `${Math.min(from, to)}%`, background: color }} />
      </div>
    </div>
  )
}

function biasColorOf(bias: string): string {
  return bias === 'bullish' ? 'var(--probex-positive)' : bias === 'bearish' ? 'var(--probex-negative)' : 'var(--probex-warning)'
}

function formatSegment(segment: string): string {
  return segment.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/**
 * Generates a mock "entry thesis" narrative for a position.
 * this could be a stored user note from order placement.
 */
function generateEntryThesis(
  position: { side: string; entryPrice: number; marketTitle: string },
  consensus?: { institutionalBias: string; score: number },
): string {
  const sideLabel = position.side.toUpperCase()
  if (consensus) {
    const biasWord = consensus.institutionalBias === 'bullish' ? 'bullish institutional positioning'
      : consensus.institutionalBias === 'bearish' ? 'bearish institutional signals'
      : 'mixed institutional signals'
    return `Entered ${sideLabel} at ${position.entryPrice}¢, aligning with ${biasWord} and a ${Math.round(consensus.score * 100)}% consensus reading at the time. Thesis based on momentum continuation and on-chain accumulation data supporting this directional view.`
  }
  return `Entered ${sideLabel} at ${position.entryPrice}¢ based on independent market analysis ahead of the resolution window.`
}
