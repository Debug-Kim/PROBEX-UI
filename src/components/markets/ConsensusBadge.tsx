'use client'

/**
 * ConsensusBadge
 *
 * ConsensusBadge already receives `score` as a prop — no internal data
 * fetching. The change is purely at the call site (MarketCard,
 * MarketTable, etc.) which now passes a live-merged score.
 *
 * This file adds:
 *   1. An optional `isLive` prop — renders a tiny pulsing dot when true
 *   2. Flash animation when the score value changes
 *
 */

import { useRef, useEffect, useState } from 'react'

interface ConsensusBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
 isLive?: boolean // parent passes live status
  className?: string
}

function scoreColor(score: number): string {
  if (score >= 65) return 'var(--probex-consensus-high)'
  if (score >= 45) return 'var(--probex-consensus-med)'
  return 'var(--probex-consensus-low)'
}

function scoreLabel(score: number): string {
  if (score >= 75) return 'Strong'
  if (score >= 60) return 'High'
  if (score >= 45) return 'Moderate'
  if (score >= 30) return 'Low'
  return 'Weak'
}

const SIZE = {
  sm: { fontSize: 11, padding: '2px 6px', gap: 4 },
  md: { fontSize: 12, padding: '3px 8px', gap: 5 },
  lg: { fontSize: 14, padding: '4px 10px', gap: 6 },
}

export function ConsensusBadge({
  score,
  size = 'md',
  isLive = false,
  className = '',
}: ConsensusBadgeProps) {
  // Normalize to a 0–100 scale. Consensus scores flow through the app as 0–1
  // fractions (e.g. 0.91); the color/label thresholds below are 0–100. Accept
  // either scale defensively so every call site renders correctly.
  const pct = score <= 1 ? score * 100 : score
  const color = scoreColor(pct)
  const label = scoreLabel(pct)
  const sz = SIZE[size]

 // flash on score change
  const prevRef = useRef(score)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (prevRef.current !== score) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 500)
      prevRef.current = score
      return () => clearTimeout(t)
    }
    return undefined
  }, [score])

  return (
    <span
      className={className}
      aria-label={`Consensus: ${label} (${pct.toFixed(0)})`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sz.gap,
        padding: sz.padding,
        borderRadius: 4,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
        color,
        fontSize: sz.fontSize,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.02em',
        transition: 'background-color 0.5s ease',
 // brief highlight flash
        ...(flash
          ? { backgroundColor: `color-mix(in srgb, ${color} 25%, transparent)` }
          : {}),
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: sz.fontSize - 2,
          height: sz.fontSize - 2,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      {pct.toFixed(0)}
      <span
        style={{
          fontWeight: 500,
          opacity: 0.8,
          fontSize: sz.fontSize - 1,
        }}
      >
        {label}
      </span>

 {/* live dot */}
      {isLive && (
        <span
          aria-hidden="true"
          className="consensus-badge-live-dot"
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: 'var(--probex-yes)',
            animation: 'probex-pulse 2s ease-in-out infinite',
            flexShrink: 0,
          }}
        />
      )}

      <style>{`
        @keyframes probex-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(2); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .consensus-badge-live-dot { animation: none !important; }
        }
      `}</style>
    </span>
  )
}
