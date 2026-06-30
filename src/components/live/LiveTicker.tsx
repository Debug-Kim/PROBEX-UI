'use client'

/**
 * LiveTicker
 *
 * Horizontal scrolling strip of recent live trade events.
 * Disabled when ENABLE_REALTIME_MARKETS is false or stream is not open.
 * Respects prefers-reduced-motion by stopping scroll animation.
 */

import { useRef, useEffect, useMemo } from 'react'
import { useLiveStore } from '@/store/liveStore'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'
import { useMarkets } from '@/hooks/useServices'
import { FEATURES } from '@/config/features'
import type { LiveActivityEntry } from '@/lib/realtime/types'

interface LiveTickerProps {
  className?: string
}

export function LiveTicker({ className = '' }: LiveTickerProps) {
  const { status, isEnabled, tickerEnabled } = {
    ...useConnectionStatus(),
    tickerEnabled: useLiveStore((s) => s.tickerEnabled),
  }
  const liveActivity = useLiveStore((s) => s.liveActivity)
  const trackRef     = useRef<HTMLDivElement>(null)

  const allMarkets   = useMarkets().data?.data ?? []
  const marketTitles = useMemo(() => {
    const map: Record<string, string> = {}
    for (const m of allMarkets) map[m.id as string] = m.question
    return map
  }, [allMarkets])

  function formatEntry(entry: LiveActivityEntry): string {
    const question = marketTitles[entry.marketId as string]
    const label = question
      ? question.slice(0, 40) + (question.length > 40 ? '…' : '')
      : entry.marketId
    return `${entry.type === 'trade' ? '⬆' : '●'} ${label} · ${entry.summary}`
}

  const isActive =
    isEnabled &&
    FEATURES.ENABLE_REALTIME_MARKETS &&
    tickerEnabled &&
    status === 'open'

  // Animate scroll continuously via CSS; pause on hover
  useEffect(() => {
    const track = trackRef.current
    if (!track || !isActive || liveActivity.length === 0) return

    let frame: number
    let offset = 0

    const scroll = () => {
      offset += 0.5
      if (offset >= track.scrollWidth / 2) offset = 0
      track.style.transform = `translateX(-${offset}px)`
      frame = requestAnimationFrame(scroll)
    }

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (!prefersReduced) {
      frame = requestAnimationFrame(scroll)
    }

    return () => cancelAnimationFrame(frame)
  }, [isActive, liveActivity.length])

  if (!isActive || liveActivity.length === 0) return null

  const items = liveActivity.slice(0, 20)

  return (
    <div
      role="marquee"
      aria-label="Live trade activity"
      aria-live="off"
      className={className}
      style={{
        overflow: 'hidden',
        borderTop: '1px solid var(--probex-border)',
        borderBottom: '1px solid var(--probex-border)',
        backgroundColor: 'var(--probex-surface)',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: 48,
          whiteSpace: 'nowrap',
          willChange: 'transform',
        }}
      >
        {/* Duplicate for seamless loop */}
        {[...items, ...items].map((entry, i) => (
          <span
            key={`${entry.id}-${i}`}
            style={{
              fontSize: 11,
              color:
                entry.type === 'trade'
                  ? 'var(--probex-yes)'
                  : 'var(--probex-text-secondary)',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {formatEntry(entry)}
          </span>
        ))}
      </div>
    </div>
  )
}
