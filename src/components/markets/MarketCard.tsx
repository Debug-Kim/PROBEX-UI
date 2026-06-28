'use client'

/**
 * MarketCard —.1
 * ──────────────────────────
 * Information-rich prediction market card.
 * Adds: mini sparkline, YES/NO probability bars, volume, resolution date,
 * category badge, glassmorphism surface, elevated hover.
 */

import Link                                              from 'next/link'
import { useMemo }                                       from 'react'
import type { MouseEvent }                               from 'react'
import { ROUTES }                                        from '@/config/constants'
import { ConsensusBadge }                                from './ConsensusBadge'
import { SentimentIndicator }                            from './SentimentIndicator'
import { ConfidenceMeter }                               from './ConfidenceMeter'
import { WatchlistButton }                               from './WatchlistButton'
import { LiveIndicator }                                 from '@/components/live/LiveIndicator'
import { useSingleMarketStream }                         from '@/hooks/useMarketStream'
import { getProbabilityHistory }                         from '@/mock/marketHistory'
import { formatCompact, probabilityColorVar }            from '@/lib/utils'
import type { Market }                                   from '@/types/market'
import type { ConsensusState }                           from '@/types/consensus'

const SEGMENT_LABEL: Record<string, string> = {
  'price-targets':          'Price Target',
  'volatility':             'Volatility',
  'etf-flows':              'ETF Flow',
  'on-chain-metrics':       'On-Chain',
  'network-health':         'Network',
  'institutional-activity': 'Institutional',
  'macro-signals':          'Macro',
  'market-structure':       'Structure',
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────

function MiniSparkline({
  marketId,
  color,
  w = 72,
  h = 28,
}: { marketId: string; color: string; w?: number; h?: number }) {
  const data = useMemo(() => getProbabilityHistory(marketId, '7d').slice(-24), [marketId])
  if (data.length < 3) return null
  const vals = data.map(d => d.probability)
  const min  = Math.min(...vals)
  const max  = Math.max(...vals)
  const rng  = max - min || 0.01
  const ptArr = vals.map((v, i) =>
    `${((i / (vals.length - 1)) * w).toFixed(1)},${(h - ((v - min) / rng) * (h - 3) - 1.5).toFixed(1)}`
  )
  const pts     = ptArr.join(' ')
  const fillPts = [`0,${h}`, ...ptArr, `${w},${h}`].join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ overflow: 'visible' }}>
      <polygon points={fillPts} fill={color} fillOpacity="0.10"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── YES / NO bars ────────────────────────────────────────────────────────────

function ProbBars({ prob }: { prob: number }) {
  const pct    = Math.round(prob * 100)
  const yesCol = probabilityColorVar(prob)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: yesCol, width: 22 }}>YES</span>
        <div style={{ flex: 1, height: 4, background: 'var(--probex-border-default)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: yesCol, borderRadius: 2, transition: 'width 0.5s ease' }}/>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: yesCol, width: 28, textAlign: 'right' }}>{pct}¢</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--probex-text-muted)', width: 22 }}>NO</span>
        <div style={{ flex: 1, height: 4, background: 'var(--probex-border-default)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${100 - pct}%`, height: '100%', background: 'var(--probex-text-disabled)', borderRadius: 2, transition: 'width 0.5s ease' }}/>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--probex-text-muted)', width: 28, textAlign: 'right' }}>{100 - pct}¢</span>
      </div>
    </div>
  )
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface MarketCardProps {
  market:     Market
  consensus:  ConsensusState
  variant?:   'grid' | 'list' | 'featured'
  className?: string
  onClick?:   (m: Market) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketCard({
  market,
  consensus,
  variant = 'grid',
  className = '',
  onClick,
}: MarketCardProps) {
  const liveView          = useSingleMarketStream(market.id)
  const probability       = liveView?.probability ?? market.probability
  const consensusScore    = liveView?.consensusScore ?? consensus.score
  const consensusConf     = liveView?.consensusConfidence ?? consensus.predictionConfidence
  const isLive            = liveView?.isLive ?? false
  const yesColor          = probabilityColorVar(probability)

  const category = SEGMENT_LABEL[market.segment] ?? market.segment
  const resolves = new Date(market.closesAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })

  const handleClick = () => onClick?.(market)

  // ── LIST variant ──────────────────────────────────────────────────────────
  if (variant === 'list') {
    return (
      <div
        className={className}
        onClick={handleClick}
        style={{
          display:         'flex',
          alignItems:      'center',
          gap:             16,
          padding:         '11px 16px',
          borderBottom:    '1px solid var(--probex-border)',
          background:      'var(--probex-surface)',
          cursor:          'pointer',
          transition:      'background 0.12s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--probex-surface-2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--probex-surface)')}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link
              href={`${ROUTES.MARKETS}/${market.id as string}`}
              onClick={(e: MouseEvent) => e.stopPropagation()}
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--probex-text-primary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {market.question}
            </Link>
            {isLive && <LiveIndicator variant="dot" />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--probex-primary)', background: 'var(--probex-primary-dim)', padding: '2px 6px', borderRadius: 99 }}>
              {category}
            </span>
            <ConsensusBadge score={consensusScore} size="sm" />
            <SentimentIndicator bias={consensus.bias} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <MiniSparkline marketId={market.id as string} color={yesColor} />
          <ConfidenceMeter confidence={consensusConf} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: yesColor }}>{Math.round(probability * 100)}¢</div>
            <div style={{ fontSize: 9, color: 'var(--probex-text-muted)' }}>{resolves}</div>
          </div>
          <WatchlistButton marketId={market.id} />
        </div>
      </div>
    )
  }

  // ── GRID / FEATURED variant ───────────────────────────────────────────────
  return (
    <div
      className={className}
      onClick={handleClick}
      style={{
        background:          'var(--probex-surface)',
        border:              '1px solid var(--probex-border)',
        borderRadius:        10,
        padding:             '14px 16px',
        display:             'flex',
        flexDirection:       'column',
        gap:                 11,
        cursor:              'pointer',
        transition:          'border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
        backdropFilter:      'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--probex-border-active)'
        el.style.transform   = 'translateY(-2px)'
        el.style.boxShadow   = '0 8px 24px rgba(0,0,0,0.18)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--probex-border)'
        el.style.transform   = 'translateY(0)'
        el.style.boxShadow   = 'none'
      }}
    >
      {/* Top: category + live + watchlist */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--probex-primary)', background: 'var(--probex-primary-dim)', padding: '2px 7px', borderRadius: 99, border: '1px solid var(--probex-yes-border)' }}>
          {category}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {isLive && <LiveIndicator variant="dot" />}
          <WatchlistButton marketId={market.id} />
        </div>
      </div>

      {/* Title */}
      <Link
        href={`${ROUTES.MARKETS}/${market.id as string}`}
        onClick={(e: MouseEvent) => e.stopPropagation()}
        style={{
          fontSize: 13, fontWeight: 600, color: 'var(--probex-text-primary)',
          textDecoration: 'none', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}
      >
        {market.question}
      </Link>

      {/* YES/NO probability bars */}
      <ProbBars prob={probability} />

      {/* Sparkline + consensus row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ConsensusBadge score={consensusScore} size="sm" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SentimentIndicator bias={consensus.bias} />
            <ConfidenceMeter confidence={consensusConf} />
          </div>
        </div>
        <MiniSparkline marketId={market.id as string} color={yesColor} />
      </div>

      {/* Footer: volume + resolution */}
      <div style={{
        display:    'flex',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTop:  '1px solid var(--probex-border)',
        fontSize:   10,
        color:      'var(--probex-text-muted)',
      }}>
        <span>Vol <strong style={{ color: 'var(--probex-text-secondary)' }}>${formatCompact(market.volume24h)}</strong></span>
        <span>Expires <strong style={{ color: 'var(--probex-text-secondary)' }}>{resolves}</strong></span>
      </div>
    </div>
  )
}
