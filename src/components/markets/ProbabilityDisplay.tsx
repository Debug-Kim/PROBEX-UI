'use client'

/**
 * ProbabilityDisplay
 *
 * Adds optional deltaBps prop so MarketCard and LiveMarketRow can show
 * directional arrows and flash colour on probability changes.
 *
 * Props are backward-compatible — deltaBps and isLive default to undefined/false.
 *
 */

import { useRef, useEffect, useState } from 'react'
import { formatPercent } from '@/lib/utils'

interface ProbabilityDisplayProps {
  probability: number    // 0–1 (app-wide convention; formatPercent scales to %)
 deltaBps?: number | undefined // basis points change; signed
 isLive?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProbabilityDisplay({
  probability,
  deltaBps,
  isLive = false,
  size = 'md',
  className = '',
}: ProbabilityDisplayProps) {
  const prevRef = useRef(probability)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

 // flash direction on change
  useEffect(() => {
    if (prevRef.current !== probability) {
      setFlash(probability > prevRef.current ? 'up' : 'down')
      const t = setTimeout(() => setFlash(null), 600)
      prevRef.current = probability
      return () => clearTimeout(t)
    }
    return undefined
  }, [probability])

  const fontSize =
    size === 'sm' ? 12 : size === 'md' ? 15 : 20

  const flashColor =
    flash === 'up'
      ? 'color-mix(in srgb, var(--probex-yes) 18%, transparent)'
      : flash === 'down'
      ? 'color-mix(in srgb, var(--probex-no) 18%, transparent)'
      : 'transparent'

  const directionColor =
    (deltaBps ?? 0) > 0 ? 'var(--probex-yes)' : 'var(--probex-no)'

  return (
    <span
      className={className}
      aria-label={`Probability: ${formatPercent(probability)}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize,
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--probex-text-primary)',
        backgroundColor: flashColor,
        borderRadius: 3,
        padding: '1px 3px',
        transition: 'background-color 0.6s ease',
      }}
    >
      {formatPercent(probability)}

 {/* directional arrow when delta is significant */}
      {isLive && deltaBps !== undefined && Math.abs(deltaBps) >= 5 && (
        <span
          aria-hidden="true"
          style={{
            fontSize: fontSize - 3,
            color: directionColor,
            lineHeight: 1,
          }}
        >
          {deltaBps > 0 ? '▲' : '▼'}
        </span>
      )}
    </span>
  )
}
