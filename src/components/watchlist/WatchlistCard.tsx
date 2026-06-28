'use client'

/**
 * WatchlistCard
 * ─────────────
 * Grid-view card for a single watchlisted market.
 *
 * Composes the shared display atoms (ConsensusBadge, SentimentIndicator) for
 * visual consistency with the rest of the app, and adds an explicit remove
 * control wired to the watchlist hook so removal is immediately reactive.
 *
 * The card body links to the market detail page; the remove button stops
 * propagation so it never triggers navigation.
 */

import Link                       from 'next/link'
import { cn, formatCompact }      from '@/lib/utils'
import { ROUTES }                 from '@/config/constants'
import { getSegmentMeta }         from '@/config/marketSegments'
import { ConsensusBadge }         from '@/components/markets/ConsensusBadge'
import { SentimentIndicator }     from '@/components/markets/SentimentIndicator'
import type { Market }            from '@/types/market'
import type { ConsensusState }    from '@/types/consensus'
import type { MouseEvent }        from 'react'

interface WatchlistCardProps {
  market:      Market
  consensus:   ConsensusState | undefined
  onRemove:    (id: string) => void
  className?:  string
}

function probabilityColor(p: number): string {
  if (p >= 0.65) return 'var(--probex-positive)'
  if (p >= 0.45) return 'var(--probex-warning)'
  return 'var(--probex-negative)'
}

export function WatchlistCard({ market, consensus, onRemove, className }: WatchlistCardProps) {
  const id        = market.id as string
  const segment   = getSegmentMeta(market.segment)
  const probPct   = Math.round(market.probability * 100)
  const probColor = probabilityColor(market.probability)
  const closes    = new Date(market.closesAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const handleRemove = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove(id)
  }

  return (
    <Link
      href={`${ROUTES.MARKETS}/${id}`}
      className={cn('relative flex flex-col gap-3 p-4 rounded-xl no-underline transition-all duration-150', className)}
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--probex-border-active)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--probex-border)' }}
      aria-label={`View ${market.title}`}
    >
      {/* Top row: segment + remove */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-2xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ background: 'var(--probex-primary-dim)', color: 'var(--probex-primary)' }}
        >
          {segment.shortLabel}
        </span>
        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remove ${market.title} from watchlist`}
          className="flex items-center justify-center w-6 h-6 rounded-md cursor-pointer transition-colors duration-100 flex-shrink-0"
          style={{ color: 'var(--probex-text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--probex-negative)'; e.currentTarget.style.background = 'var(--probex-negative-dim)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--probex-text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: 'var(--probex-text-primary)' }}>
        {market.title}
      </h3>

      {/* Signal row: consensus + sentiment */}
      <div className="flex items-center gap-2 flex-wrap">
        {consensus && <ConsensusBadge score={consensus.score} size="sm" />}
        {consensus && <SentimentIndicator bias={consensus.bias} size="sm" />}
      </div>

      {/* Footer: probability + volume + closes */}
      <div className="flex items-center justify-between pt-2.5 mt-auto" style={{ borderTop: '1px solid var(--probex-border)' }}>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-disabled)' }}>Probability</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: probColor }}>{probPct}%</span>
        </div>
        <div className="flex flex-col gap-0.5 items-end">
          <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-disabled)' }}>24h Vol</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--probex-text-secondary)' }}>${formatCompact(market.volume24h)}</span>
        </div>
        <div className="flex flex-col gap-0.5 items-end">
          <span className="text-2xs uppercase tracking-wider" style={{ color: 'var(--probex-text-disabled)' }}>Closes</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--probex-text-secondary)' }}>{closes}</span>
        </div>
      </div>
    </Link>
  )
}
