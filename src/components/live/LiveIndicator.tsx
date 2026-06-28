'use client'

/**
 * LiveIndicator
 *
 * Compact "LIVE" pill reused in TopNavigation, MarketCard, and LiveMarketsView.
 * Only renders when the stream is open and ENABLE_REALTIME_MARKETS is true.
 */

import { useConnectionStatus } from '@/hooks/useConnectionStatus'

interface LiveIndicatorProps {
  /** 'dot' = pulsing dot only; 'pill' = "● LIVE" pill */
  variant?: 'dot' | 'pill'
  className?: string
}

export function LiveIndicator({
  variant = 'pill',
  className = '',
}: LiveIndicatorProps) {
  const { status, isEnabled } = useConnectionStatus()

  if (!isEnabled || status !== 'open') return null

  if (variant === 'dot') {
    return (
      <span
        aria-label="Live"
        aria-hidden="true"
        className={`live-indicator-dot ${className}`}
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'var(--probex-yes)',
          animation: 'probex-pulse 2s ease-in-out infinite',
          flexShrink: 0,
        }}
      >
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            .live-indicator-dot { animation: none !important; }
          }
        `}</style>
      </span>
    )
  }

  return (
    <span
      className={`live-indicator-pill ${className}`}
      aria-label="Live data stream active"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 6px',
        borderRadius: 4,
        backgroundColor: 'color-mix(in srgb, var(--probex-yes) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--probex-yes) 30%, transparent)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--probex-yes)',
        textTransform: 'uppercase',
      }}
    >
      <span
        aria-hidden="true"
        className="live-indicator-dot"
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: 'var(--probex-yes)',
          animation: 'probex-pulse 2s ease-in-out infinite',
          flexShrink: 0,
        }}
      />
      Live
      <style>{`
        @keyframes probex-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(2); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .live-indicator-dot { animation: none !important; }
        }
      `}</style>
    </span>
  )
}
