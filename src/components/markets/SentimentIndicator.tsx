'use client'

/**
 * SentimentIndicator
 *
 * Adds optional `liveBias` prop so parents can pass live consensus bias
 * without the component needing a store subscription.
 * Flash animation fires when bias changes.
 *
 * Backward-compatible: `liveBias` defaults to undefined, behaviour
 * identical to when not supplied.
 *
 */

import { useRef, useEffect, useState } from 'react'

type Bias = 'bullish' | 'bearish' | 'neutral'

interface SentimentIndicatorProps {
  bias: Bias
 liveBias?: Bias | undefined // live override from parent
  size?: 'sm' | 'md'
  className?: string
}

const BIAS_CONFIG: Record<
  Bias,
  { label: string; color: string; icon: string }
> = {
  bullish: {
    label: 'Bullish',
    color: 'var(--probex-yes)',
    icon: '▲',
  },
  bearish: {
    label: 'Bearish',
    color: 'var(--probex-no)',
    icon: '▼',
  },
  neutral: {
    label: 'Neutral',
    color: 'var(--probex-text-muted)',
    icon: '●',
  },
}

export function SentimentIndicator({
  bias,
  liveBias,
  size = 'md',
  className = '',
}: SentimentIndicatorProps) {
 // use liveBias when provided
  const effectiveBias: Bias = liveBias ?? bias
  const config = BIAS_CONFIG[effectiveBias]

  const prevRef = useRef<Bias>(effectiveBias)
  const [flash, setFlash] = useState(false)

 // flash on bias change
  useEffect(() => {
    if (prevRef.current !== effectiveBias) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 600)
      prevRef.current = effectiveBias
      return () => clearTimeout(t)
    }
    return undefined
  }, [effectiveBias])

  const fontSize = size === 'sm' ? 11 : 12

  return (
    <span
      className={className}
      aria-label={`Sentiment: ${config.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize,
        fontWeight: 600,
        color: config.color,
        transition: 'color 0.3s ease',
        backgroundColor: flash
          ? `color-mix(in srgb, ${config.color} 15%, transparent)`
          : 'transparent',
        borderRadius: 3,
        padding: '1px 3px',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: fontSize - 2 }}>
        {config.icon}
      </span>
      {config.label}
    </span>
  )
}
