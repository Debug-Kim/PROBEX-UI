'use client'

/**
 * HeroCarousel —.1
 * ──────────────────────────
 * The primary visual focal point of the Probex dashboard.
 * Each slide is a full market intelligence brief: thesis, probability,
 * consensus breakdown, volume, resolution, mini chart, and activity pulse.
 *
 * Design: prediction market terminal, not a marketing banner.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter }                                           from 'next/navigation'
import { getFeaturedMarkets }                                  from '@/mock/markets'
import { MOCK_CONSENSUS_MAP }                                  from '@/mock/consensus'
import { getProbabilityHistory }                               from '@/mock/marketHistory'
import { ROUTES }                                             from '@/config/constants'
import { formatCompact, probabilityColorVar }                 from '@/lib/utils'
import type { Market }                                         from '@/types/market'
import type { ConsensusState }                                 from '@/types/consensus'

// ─── Segment display ─────────────────────────────────────────────────────────

const SEGMENT_LABEL: Record<string, string> = {
  'price-targets':         'Price Target',
  'volatility':            'Volatility',
  'etf-flows':             'ETF Flow',
  'on-chain-metrics':      'On-Chain',
  'network-health':        'Network',
  'institutional-activity': 'Institutional',
  'macro-signals':         'Macro',
  'market-structure':      'Structure',
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────

function Sparkline({
  data,
  width = 180,
  height = 48,
  color,
}: {
  data:    Array<{ probability: number }>
  width?:  number
  height?: number
  color:   string
}) {
  if (data.length < 2) return null
  const vals = data.map(d => d.probability)
  const min  = Math.min(...vals)
  const max  = Math.max(...vals)
  const rng  = max - min || 0.01
  const pts  = vals.map((v, i) =>
    `${((i / (vals.length - 1)) * width).toFixed(1)},${(height - ((v - min) / rng) * (height - 4) - 2).toFixed(1)}`
  )
  const polyFill = [`0,${height}`, ...pts, `${width},${height}`].join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={`hsg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.20"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={polyFill} fill={`url(#hsg-${color.replace('#','')})`}/>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Probability Gauge ────────────────────────────────────────────────────────

function ProbGauge({ prob }: { prob: number }) {
  const pct  = Math.round(prob * 100)
  const noPct = 100 - pct
  const yesColor = probabilityColorVar(prob)
  const noColor  = 'var(--probex-text-muted)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 110 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: 'var(--probex-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <span>YES</span>
        <span>NO</span>
      </div>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: yesColor, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {pct}%
        </span>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--probex-border-default)', overflow: 'hidden', margin: '0 4px' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: yesColor, borderRadius: 3, transition: 'width 0.8s ease' }}/>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: noColor, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {noPct}%
        </span>
      </div>
    </div>
  )
}

// ─── Consensus Row ────────────────────────────────────────────────────────────

function ConsensusRow({ consensus }: { consensus: ConsensusState }) {
  const score = Math.round(consensus.score * 100)
  const BIAS: Record<string, { label: string; color: string }> & {
    neutral: { label: string; color: string }
  } = {
    bullish: { label: 'Bullish', color: 'var(--probex-positive)' },
    bearish: { label: 'Bearish', color: 'var(--probex-negative)' },
    neutral: { label: 'Neutral', color: 'var(--probex-text-muted)' },
  }
  const CONF: Record<string, string> = {
    high: 'var(--probex-positive)', medium: 'var(--probex-warning)', low: 'var(--probex-negative)',
  }
  const bias = BIAS[consensus.bias] ?? BIAS.neutral
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--probex-text-muted)', textTransform: 'uppercase' }}>
          Consensus Engine
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: bias.color }}>{bias.label}</span>
          <span style={{ fontSize: 10, color: 'var(--probex-text-muted)' }}>·</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: CONF[consensus.confidence] ?? 'var(--probex-text-muted)' }}>
            {consensus.confidence} confidence
          </span>
        </div>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: 'var(--probex-border-default)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          borderRadius: 3,
          background: bias.color,
          transition: 'width 0.8s ease',
        }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--probex-text-muted)' }}>
        <span>Score: <strong style={{ color: 'var(--probex-text-primary)' }}>{score}</strong>/100</span>
        <span>Signal: <strong style={{ color: 'var(--probex-text-primary)' }}>{consensus.signalStrength}</strong></span>
      </div>
    </div>
  )
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display:      'flex',
      flexDirection: 'column',
      gap:           2,
      padding:       '7px 12px',
      background:    'rgba(255,255,255,0.03)',
      border:        '1px solid var(--probex-border)',
      borderRadius:  7,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--probex-text-muted)' }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--probex-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  )
}

// ─── Hero Slide ───────────────────────────────────────────────────────────────

function HeroSlide({
  market,
  consensus,
  history,
  isActive,
  onClick,
}: {
  market:    Market
  consensus: ConsensusState
  history:   Array<{ probability: number }>
  isActive:  boolean
  onClick:   () => void
}) {
  const first = history[0]
  const last  = history[history.length - 1]
  const move  = (first && last) ? last.probability - first.probability : 0
  const yesColor = probabilityColorVar(market.probability)
  const category = SEGMENT_LABEL[market.segment] ?? market.segment

  const resolves = new Date(market.closesAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={isActive ? 0 : -1}
      aria-label={`View market: ${market.title}`}
      style={{
        position:      'absolute',
        inset:         0,
        opacity:       isActive ? 1 : 0,
        transform:     isActive ? 'translateX(0)' : 'translateX(12px)',
        transition:    'opacity 0.45s ease, transform 0.45s ease',
        pointerEvents: isActive ? 'auto' : 'none',
        cursor:        'pointer',
        display:       'flex',
        flexDirection: 'column',
        padding:       '22px 28px 18px',
        gap:           16,
      }}
    >
      {/* Top row: category + movement */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color:      'var(--probex-primary)',
            background: 'var(--probex-primary-dim)',
            padding:    '3px 8px', borderRadius: 99,
            border:     '1px solid var(--probex-yes-border)',
          }}>
            {category}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: move >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)',
          }}>
            {move >= 0 ? '▲' : '▼'} {Math.abs(move * 100).toFixed(1)}% 7d
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--probex-text-muted)' }}>
          Resolves {resolves}
        </span>
      </div>

      {/* Title */}
      <h2 style={{
        fontSize:    'clamp(16px, 2.4vw, 22px)',
        fontWeight:  750,
        letterSpacing: '-0.01em',
        color:       'var(--probex-text-primary)',
        lineHeight:  1.3,
        maxWidth:    '72%',
        margin:      0,
      }}>
        {market.title}
      </h2>

      {/* Main content row */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flex: 1 }}>

        {/* Left: probability + consensus */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minWidth: 0 }}>
          <ProbGauge prob={market.probability} />
          <ConsensusRow consensus={consensus} />
        </div>

        {/* Right: larger chart + stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 240, marginBottom: 2 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--probex-text-muted)' }}>
              7-Day Probability
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: move >= 0 ? 'var(--probex-positive)' : 'var(--probex-negative)' }}>
              {move >= 0 ? '+' : ''}{(move * 100).toFixed(1)}pp
            </span>
          </div>
          <Sparkline data={history.slice(-40)} width={240} height={68} color={yesColor} />
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            <StatPill label="Volume" value={`$${formatCompact(market.volume24h)}`} />
            <StatPill label="O.I." value={`$${formatCompact(market.openInterest)}`} />
          </div>
        </div>
      </div>

      {/* Thesis strip */}
      {market.description && (
        <div style={{
          fontSize:   11,
          color:      'var(--probex-text-muted)',
          lineHeight: 1.5,
          paddingTop: 10,
          borderTop:  '1px solid var(--probex-border)',
          display:    '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow:   'hidden',
        }}>
          <strong style={{ color: 'var(--probex-text-secondary)', fontWeight: 600 }}>Thesis: </strong>
          {market.description}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HeroCarousel() {
  const router   = useRouter()
  const markets  = useMemo(() => getFeaturedMarkets(6), [])
  const [current, setCurrent]   = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const DURATION    = 7000

  const slides = useMemo(() =>
    markets.map(m => ({
      market:    m,
      consensus: MOCK_CONSENSUS_MAP[m.id as string]!,
      history:   getProbabilityHistory(m.id as string),
    })),
    [markets],
  )

  useEffect(() => {
    if (isPaused || slides.length === 0) return
    const id = setInterval(() =>
      setCurrent(c => (c + 1) % slides.length), DURATION)
    return () => clearInterval(id)
  }, [isPaused, slides.length])

  const go = useCallback((idx: number) => {
    setCurrent(idx)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 12_000)
  }, [])

  const handleClick = useCallback(() => {
    const m = slides[current]?.market
    if (m) router.push(`${ROUTES.MARKETS}/${m.id as string}`)
  }, [current, slides, router])

  if (slides.length === 0) return null

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position:   'relative',
        borderRadius: 12,
        overflow:   'hidden',
        height:     300,
        background: 'var(--probex-surface)',
        border:     '1px solid var(--probex-border)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Background radial accent */}
      <div style={{
        position:   'absolute',
        inset:       0,
        background: 'radial-gradient(ellipse 55% 90% at 92% 15%, var(--probex-primary-dim) 0%, transparent 65%)',
        pointerEvents: 'none',
        zIndex:      0,
      }} />

      {/* Slides */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {slides.map((s, i) => (
          <HeroSlide
            key={s.market.id as string}
            market={s.market}
            consensus={s.consensus}
            history={s.history}
            isActive={i === current}
            onClick={handleClick}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 2, background: 'var(--probex-border)', zIndex: 2,
      }}>
        {!isPaused && (
          <div
            key={current}
            style={{
              height: '100%',
              background: 'var(--probex-primary)',
              animation: `hero-progress ${DURATION}ms linear`,
              transformOrigin: 'left',
            }}
          />
        )}
      </div>

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', bottom: 14, right: 20,
        display: 'flex', gap: 5, zIndex: 3,
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={e => { e.stopPropagation(); go(i) }}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width:      i === current ? 20 : 5,
              height:     5,
              borderRadius: 3,
              background: i === current ? 'var(--probex-primary)' : 'var(--probex-border-strong)',
              border:     'none',
              cursor:     'pointer',
              padding:    0,
              transition: 'width 0.25s ease, background 0.2s',
            }}
          />
        ))}
      </div>

      {/* Paused badge */}
      {isPaused && (
        <div style={{
          position: 'absolute', top: 10, right: 14, zIndex: 3,
          fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
          color: 'var(--probex-text-muted)',
          background: 'var(--probex-surface-2)',
          padding: '2px 7px', borderRadius: 99,
          border: '1px solid var(--probex-border)',
        }}>
          Paused
        </div>
      )}
    </div>
  )
}
