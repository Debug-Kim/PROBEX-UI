'use client'

/**
 * ConfidenceMeter
 *
 * Adds optional `liveConfidence` prop (0–1) so MarketHeader and MarketCard
 * can pass through the live consensus confidence value.
 *
 * The bar width transitions via CSS so changes animate smoothly.
 * Backward-compatible: renders identically to when prop absent.
 *
 */


interface ConfidenceMeterProps {
  confidence: number          // static 0–1
 liveConfidence?: number // live override 0–1
  size?: 'sm' | 'md'
  showLabel?: boolean
  className?: string
}

function confidenceColor(c: number): string {
  if (c >= 0.7) return 'var(--probex-consensus-high)'
  if (c >= 0.5) return 'var(--probex-consensus-med)'
  return 'var(--probex-consensus-low)'
}

function confidenceLabel(c: number): string {
  if (c >= 0.8) return 'Very High'
  if (c >= 0.65) return 'High'
  if (c >= 0.5) return 'Medium'
  if (c >= 0.35) return 'Low'
  return 'Very Low'
}

export function ConfidenceMeter({
  confidence,
  liveConfidence,
  size = 'md',
  showLabel = false,
  className = '',
}: ConfidenceMeterProps) {
 // use live value when provided
  const effective = liveConfidence ?? confidence
  const pct = Math.round(effective * 100)
  const color = confidenceColor(effective)
  const label = confidenceLabel(effective)

  const barHeight = size === 'sm' ? 3 : 4
  const barWidth = size === 'sm' ? 48 : 64

  return (
    <span
      className={className}
      aria-label={`Confidence: ${label} (${pct}%)`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {/* Bar track */}
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: barWidth,
          height: barHeight,
          borderRadius: barHeight,
          backgroundColor: 'var(--probex-surface-3)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Fill — CSS transition animates live updates */}
        <span
          style={{
            display: 'block',
            height: '100%',
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: barHeight,
            transition: 'width 0.4s ease, background-color 0.3s ease',
          }}
        />
      </span>

      {showLabel && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--probex-text-muted)',
          }}
        >
          {label}
        </span>
      )}
    </span>
  )
}
