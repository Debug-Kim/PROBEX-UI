'use client'

import { useMemo }          from 'react'
import { cn, estimateYesPayout, estimateContracts, formatCurrency } from '@/lib/utils'
import { useMarketStore }   from '@/store/marketStore'
import type { ConsensusState } from '@/types/consensus'
import type { ReactNode } from 'react'

interface TradeSummaryProps {
  yesPrice:    number       // cents
  noPrice:     number       // cents
  consensus?:  ConsensusState | undefined
  className?:  string
}

// ─── Position size classification ────────────────────────────────────────

type PositionSize = 'Micro' | 'Small' | 'Medium' | 'Large' | 'Institutional'

function classifyPositionSize(stake: number): PositionSize {
  if (stake < 25)   return 'Micro'
  if (stake < 100)  return 'Small'
  if (stake < 500)  return 'Medium'
  if (stake < 5000) return 'Large'
  return 'Institutional'
}

// ─── Breakeven probability ───────────────────────────────────────────────

function computeBreakevenProbability(priceInCents: number): number {
  // The breakeven is the price itself — at 67¢ you need YES to hit 67%+ to profit
  return priceInCents / 100
}

// ─── High-conviction detection ────────────────────────────────────────────

type ConvictionLevel = 'High Conviction' | 'Standard' | 'Contrarian'

function classifyConviction(
  stake:         number,
  consensusAlignment: AlignmentType | null,
): ConvictionLevel {
  if (!consensusAlignment || stake <= 0) return 'Standard'
  if (consensusAlignment === 'aligned' && stake >= 100) return 'High Conviction'
  if (consensusAlignment === 'divergent') return 'Contrarian'
  return 'Standard'
}

type AlignmentType = 'aligned' | 'divergent' | 'neutral'

/**
 * TradeSummary
 * ────────────
 * Enhanced trade summary with full P&L breakdown, breakeven analysis,
 * position classification, and conviction rating.
 *
 * All calculations are mock math — no real orders.
 * connect to trading service for real order simulation.
 *
 * Display hierarchy (top → bottom):
 *   1. Contracts + Est. Payout   — most important outcome metrics
 *   2. Est. Return % + Max Loss  — P&L framing
 *   3. Est. Profit               — net gain if correct
 *   4. Breakeven Probability     — Kalshi-style market analysis
 *   5. ─── divider ───
 *   6. Consensus Alignment       — Probex differentiator
 *   7. Risk Rating               — straightforward risk label
 *   8. Position Size             — classification
 *   9. Conviction Level          — high/standard/contrarian
 */
export function TradeSummary({ yesPrice, noPrice, consensus, className }: TradeSummaryProps) {
  const { stakeInput, activeOutcome } = useMarketStore()
  const stake  = parseFloat(stakeInput) || 0
  const price  = activeOutcome === 'yes' ? yesPrice : noPrice
  const isYes  = activeOutcome === 'yes'

  const computed = useMemo(() => {
    if (stake <= 0) return null

    const payout    = estimateYesPayout(stake, price)
    const contracts = estimateContracts(stake, price)
    const profit    = payout - stake
    const returnPct = stake > 0 ? (profit / stake) * 100 : 0
    const breakeven = computeBreakevenProbability(price)

    // Risk: based on implied probability via price
    const risk: string =
      price < 15 || price > 85 ? 'Very High' :
      price < 25 || price > 75 ? 'High'      :
      price < 40 || price > 60 ? 'Medium'    :
                                  'Low'

    // Consensus alignment
    let alignment: AlignmentType | null = null
    if (consensus) {
      const bullish = consensus.institutionalBias === 'bullish' && consensus.score > 0.6
      const bearish = consensus.institutionalBias === 'bearish' || consensus.score < 0.4
      if      (isYes  && bullish)  alignment = 'aligned'
      else if (!isYes && bearish)  alignment = 'aligned'
      else if (isYes  && bearish)  alignment = 'divergent'
      else if (!isYes && bullish)  alignment = 'divergent'
      else alignment = 'neutral'
    }

    const positionSize = classifyPositionSize(stake)
    const conviction   = classifyConviction(stake, alignment)

    return {
      payout, contracts, profit, returnPct, breakeven, risk,
      alignment, positionSize, conviction,
    }
  }, [stake, price, isYes, consensus])

  const isEmpty = !computed

  return (
    <div
      className={cn('flex flex-col gap-0 rounded-lg overflow-hidden', className)}
      style={{ border: '1px solid var(--probex-border)' }}
    >
      {/* ── Core outcome metrics ── */}
      <SummaryRow label="Contracts"
        value={isEmpty ? '—' : computed.contracts.toLocaleString()}
        muted={isEmpty} />

      <SummaryRow label="Est. Payout (Win)"
        value={isEmpty ? '—' : formatCurrency(computed.payout)}
        valueColor={isEmpty ? undefined : 'var(--probex-positive)'}
        bold muted={isEmpty} />

      <SummaryRow label="Est. Net Profit"
        value={isEmpty ? '—' : `+${formatCurrency(computed.profit)}`}
        valueColor={isEmpty ? undefined : 'var(--probex-positive)'}
        muted={isEmpty} />

      <SummaryRow label="Est. Return"
        value={isEmpty ? '—' : `+${computed.returnPct.toFixed(1)}%`}
        valueColor={isEmpty ? undefined : 'var(--probex-positive)'}
        muted={isEmpty} />

      <SummaryRow label="Max Loss (Stake)"
        value={isEmpty ? '—' : formatCurrency(parseFloat(stakeInput) || 0)}
        valueColor={isEmpty ? undefined : 'var(--probex-negative)'}
        muted={isEmpty} />

      <SummaryRow label="Breakeven"
        value={isEmpty ? '—' : `${Math.round(computed.breakeven * 100)}% probability`}
        valueColor={isEmpty ? undefined : 'var(--probex-text-secondary)'}
        muted={isEmpty} />

      {/* ── Intelligence divider ── */}
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{ background: 'var(--probex-surface-2)', borderTop: '1px solid var(--probex-border)', borderBottom: '1px solid var(--probex-border)' }}
      >
        <span className="live-dot w-1 h-1" aria-hidden="true" />
        <span className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--probex-primary)', opacity: 0.75 }}>
          Probex Intelligence
        </span>
      </div>

      {/* ── Intelligence metrics ── */}
      {consensus && !isEmpty && computed.alignment && (
        <SummaryRow label="Consensus Alignment"
          value={<AlignmentChip alignment={computed.alignment} />}
          muted={false} />
      )}

      <SummaryRow label="Risk Category"
        value={isEmpty ? '—' : <RiskChip rating={computed.risk} />}
        muted={isEmpty} />

      <SummaryRow label="Position Size"
        value={isEmpty ? '—' : <SizeChip size={computed.positionSize} />}
        muted={isEmpty} />

      <SummaryRow label="Conviction"
        value={isEmpty ? '—' : <ConvictionChip level={computed.conviction} />}
        muted={isEmpty} />
    </div>
  )
}

// ─── Summary Row ──────────────────────────────────────────────────────────

function SummaryRow({
  label, value, valueColor, bold, muted,
}: {
  label:      string
  value:      ReactNode
  valueColor?: string | undefined
  bold?:       boolean
  muted?:      boolean
}) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2"
      style={{ borderBottom: '1px solid var(--probex-border)' }}
    >
      <span className="text-xs" style={{ color: 'var(--probex-text-muted)' }}>{label}</span>
      {typeof value === 'string' ? (
        <span
          className={cn('text-xs tabular-nums', bold && 'font-semibold')}
          style={{ color: muted ? 'var(--probex-text-disabled)' : (valueColor ?? 'var(--probex-text-primary)') }}
        >
          {value}
        </span>
      ) : (
        <div>{value}</div>
      )}
    </div>
  )
}

// ─── Chips ────────────────────────────────────────────────────────────────

function AlignmentChip({ alignment }: { alignment: AlignmentType }) {
  const cfg = {
    aligned:   { label: '⚡ Aligned',   color: 'var(--probex-positive)' },
    divergent: { label: '⚠ Contrarian', color: 'var(--probex-warning)'  },
    neutral:   { label: '→ Neutral',    color: 'var(--probex-text-muted)'},
  }[alignment]
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded"
      style={{ background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

function RiskChip({ rating }: { rating: string }) {
  const color =
    rating === 'Very High' ? 'var(--probex-negative)' :
    rating === 'High'      ? '#F97316'                 :
    rating === 'Medium'    ? 'var(--probex-warning)'   :
                             'var(--probex-positive)'
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded"
      style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}>
      {rating}
    </span>
  )
}

function SizeChip({ size }: { size: PositionSize }) {
  const color =
    size === 'Institutional' ? 'var(--probex-primary)' :
    size === 'Large'         ? 'var(--probex-positive)':
    size === 'Medium'        ? 'var(--probex-text-secondary)' :
                               'var(--probex-text-muted)'
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded"
      style={{ background: 'var(--probex-surface-2)', color }}>
      {size}
    </span>
  )
}

function ConvictionChip({ level }: { level: ConvictionLevel }) {
  const cfg = {
    'High Conviction': { color: 'var(--probex-primary)',  icon: '⚡' },
    'Standard':        { color: 'var(--probex-text-muted)',icon: '' },
    'Contrarian':      { color: 'var(--probex-warning)',   icon: '⚠' },
  }[level]
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded"
      style={{ background: `color-mix(in srgb, ${cfg.color} 10%, transparent)`, color: cfg.color }}>
      {cfg.icon && <span className="mr-0.5">{cfg.icon}</span>}{level}
    </span>
  )
}
