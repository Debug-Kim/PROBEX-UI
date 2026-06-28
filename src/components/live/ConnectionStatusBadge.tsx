'use client'

/**
 * ConnectionStatusBadge
 *
 * Displays the current WebSocket connection status.
 * Used in TopNavigation and the Live Markets page header.
 *
 * All colours from CSS variables — all 5 themes work.
 * Reduced-motion: pulse animation disabled via prefers-reduced-motion.
 */

import { useConnectionStatus } from '@/hooks/useConnectionStatus'
import type { ConnectionStatus } from '@/lib/realtime/types'

interface StatusConfig {
  label: string
  dotColor: string     // CSS variable name
  showPulse: boolean
}

const STATUS_CONFIG: Record<ConnectionStatus, StatusConfig> = {
  idle: {
    label: 'Stream idle',
    dotColor: 'var(--probex-text-muted)',
    showPulse: false,
  },
  connecting: {
    label: 'Connecting',
    dotColor: 'var(--probex-warning)',
    showPulse: true,
  },
  open: {
    label: 'Live',
    dotColor: 'var(--probex-yes)',
    showPulse: true,
  },
  reconnecting: {
    label: 'Reconnecting',
    dotColor: 'var(--probex-warning)',
    showPulse: true,
  },
  closed: {
    label: 'Disconnected',
    dotColor: 'var(--probex-no)',
    showPulse: false,
  },
  error: {
    label: 'Stream error',
    dotColor: 'var(--probex-no)',
    showPulse: false,
  },
}

interface ConnectionStatusBadgeProps {
  /** 'full' shows label + dot (for Live page header) */
  variant?: 'dot' | 'full'
  className?: string
}

export function ConnectionStatusBadge({
  variant = 'full',
  className = '',
}: ConnectionStatusBadgeProps) {
  const { status, latencyMs, isEnabled } = useConnectionStatus()

  if (!isEnabled) return null

  const config = STATUS_CONFIG[status]

  return (
    <span
      className={`connection-status-badge ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`Stream status: ${config.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.04em',
        color: 'var(--probex-text-secondary)',
        textTransform: 'uppercase',
      }}
    >
      {/* Pulse dot */}
      <span
        aria-hidden="true"
        style={{
          position: 'relative',
          display: 'inline-block',
          width: 8,
          height: 8,
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: config.dotColor,
          }}
        />
        {config.showPulse && (
          <span
            className="status-pulse"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundColor: config.dotColor,
              animation: 'probex-pulse 2s ease-in-out infinite',
              opacity: 0.5,
            }}
          />
        )}
      </span>

      {variant === 'full' && (
        <>
          <span>{config.label}</span>
          {status === 'open' && latencyMs > 0 && (
            <span
              style={{
                color: 'var(--probex-text-muted)',
                fontSize: '10px',
              }}
            >
              {latencyMs}ms
            </span>
          )}
        </>
      )}

      <style>{`
        @keyframes probex-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(2.2); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .status-pulse { animation: none !important; }
        }
      `}</style>
    </span>
  )
}
