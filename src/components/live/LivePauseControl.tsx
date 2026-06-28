'use client'

/**
 * LivePauseControl
 *
 * Pause / resume the live stream rendering.
 * When paused, liveStore continues buffering but components see frozen data.
 * Used in LiveMarketsView header.
 */

import { useConnectionStatus } from '@/hooks/useConnectionStatus'

interface LivePauseControlProps {
  className?: string
}

export function LivePauseControl({ className = '' }: LivePauseControlProps) {
  const { isPaused, setIsPaused, status, isEnabled } = useConnectionStatus()

  if (!isEnabled || (status !== 'open' && status !== 'reconnecting')) {
    return null
  }

  return (
    <button
      type="button"
      onClick={() => setIsPaused(!isPaused)}
      aria-pressed={isPaused}
      aria-label={isPaused ? 'Resume live stream' : 'Pause live stream'}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 6,
        border: '1px solid var(--probex-border-default)',
        backgroundColor: isPaused
          ? 'color-mix(in srgb, var(--probex-warning) 12%, transparent)'
          : 'var(--probex-surface-2)',
        color: isPaused ? 'var(--probex-warning)' : 'var(--probex-text-secondary)',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
    >
      {isPaused ? (
        <>
          <svg
            aria-hidden="true"
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <polygon points="2,1 11,6 2,11" />
          </svg>
          Resume
        </>
      ) : (
        <>
          <svg
            aria-hidden="true"
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <rect x="1" y="1" width="4" height="10" rx="1" />
            <rect x="7" y="1" width="4" height="10" rx="1" />
          </svg>
          Pause
        </>
      )}
    </button>
  )
}
