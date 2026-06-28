'use client'

/**
 * WatchlistTable
 * ──────────────
 * List/table view for the watchlist. Each row links to the market detail
 * page; the trailing remove control is wired to the watchlist hook and stops
 * propagation so it never triggers navigation.
 *
 * Static by design — the watchlist does not subscribe to live ticks (unlike
 * MarketTable), keeping the page lightweight.
 */

import { useRouter }            from 'next/navigation'
import { cn, formatCompact }    from '@/lib/utils'
import { ROUTES }               from '@/config/constants'
import { getSegmentMeta }       from '@/config/marketSegments'
import { ConsensusBadge }       from '@/components/markets/ConsensusBadge'
import { SentimentIndicator }   from '@/components/markets/SentimentIndicator'
import type { Market }          from '@/types/market'
import type { ConsensusState }  from '@/types/consensus'
import type { MouseEvent }      from 'react'

export interface WatchlistRowData {
  market:     Market
  consensus:  ConsensusState | undefined
}

interface WatchlistTableProps {
  items:     WatchlistRowData[]
  onRemove:  (id: string) => void
  className?: string
}

function probabilityColor(p: number): string {
  if (p >= 0.65) return 'var(--probex-positive)'
  if (p >= 0.45) return 'var(--probex-warning)'
  return 'var(--probex-negative)'
}

const TH_STYLE = {
  padding:       '8px 12px',
  textAlign:     'left' as const,
  fontSize:      10,
  fontWeight:    700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color:         'var(--probex-text-muted)',
  whiteSpace:    'nowrap' as const,
}

export function WatchlistTable({ items, onRemove, className }: WatchlistTableProps) {
  const router = useRouter()

  return (
    <div
      className={cn('rounded-xl overflow-hidden overflow-x-auto', className)}
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--probex-border)' }}>
            <th style={TH_STYLE}>Market</th>
            <th style={TH_STYLE}>Consensus</th>
            <th style={TH_STYLE}>Sentiment</th>
            <th style={{ ...TH_STYLE, textAlign: 'right' }}>Probability</th>
            <th style={{ ...TH_STYLE, textAlign: 'right' }}>24h Volume</th>
            <th style={{ ...TH_STYLE, textAlign: 'right' }}>Closes</th>
            <th style={{ ...TH_STYLE, textAlign: 'right' }} aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {items.map(({ market, consensus }) => {
            const id      = market.id as string
            const segment = getSegmentMeta(market.segment)
            const probPct = Math.round(market.probability * 100)
            const closes  = new Date(market.closesAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

            const handleRemove = (e: MouseEvent) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove(id)
            }

            return (
              <tr
                key={id}
                onClick={() => router.push(`${ROUTES.MARKETS}/${id}`)}
                style={{ borderBottom: '1px solid var(--probex-border)', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--probex-surface-2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Market */}
                <td style={{ padding: '11px 12px', maxWidth: 320 }}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--probex-text-primary)' }}>
                      {market.title}
                    </span>
                    <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>{segment.label}</span>
                  </div>
                </td>

                {/* Consensus */}
                <td style={{ padding: '11px 12px' }}>
                  {consensus ? <ConsensusBadge score={consensus.score} size="sm" /> : <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>—</span>}
                </td>

                {/* Sentiment */}
                <td style={{ padding: '11px 12px' }}>
                  {consensus ? <SentimentIndicator bias={consensus.bias} size="sm" /> : <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>—</span>}
                </td>

                {/* Probability */}
                <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  <span className="text-sm font-bold" style={{ color: probabilityColor(market.probability) }}>{probPct}%</span>
                </td>

                {/* Volume */}
                <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  <span className="text-sm" style={{ color: 'var(--probex-text-secondary)' }}>${formatCompact(market.volume24h)}</span>
                </td>

                {/* Closes */}
                <td style={{ padding: '11px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  <span className="text-sm" style={{ color: 'var(--probex-text-secondary)' }}>{closes}</span>
                </td>

                {/* Remove */}
                <td style={{ padding: '11px 12px', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={handleRemove}
                    aria-label={`Remove ${market.title} from watchlist`}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-md cursor-pointer transition-colors duration-100"
                    style={{ color: 'var(--probex-text-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--probex-negative)'; e.currentTarget.style.background = 'var(--probex-negative-dim)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--probex-text-muted)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
