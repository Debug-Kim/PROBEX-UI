'use client'

import { useState, useEffect } from 'react'
import { cn }                  from '@/lib/utils'
import type { MouseEvent } from 'react'

interface WatchlistButtonProps {
  marketId:   string
  size?:      'sm' | 'md'
  variant?:   'icon' | 'pill'
  className?: string
}

// ─── Mock persistence via sessionStorage ──────────────────────────────────
// replace with userService.toggleWatchlist + optimistic update.

const STORAGE_KEY = 'probex_watchlist'

function getWatchlist(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function setWatchlist(ids: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch { /* noop */ }
}

/**
 * WatchlistButton
 * ───────────────
 * Reusable watchlist toggle. State persists across page navigations
 * within the session via sessionStorage.
 *
 * Used in: MarketCard, MarketHeader
 * wire to user preference service for cross-device persistence.
 *
 * Variants:
 *   icon  — star icon only (compact, for market cards)
 *   pill  — star + label (for market header)
 */
export function WatchlistButton({
  marketId,
  size      = 'sm',
  variant   = 'icon',
  className,
}: WatchlistButtonProps) {
  const [isWatching, setIsWatching] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Hydrate from storage on mount
  useEffect(() => {
    setIsWatching(getWatchlist().has(marketId))
  }, [marketId])

  const toggle = (e: MouseEvent) => {
    e.stopPropagation()  // prevent card click-through
    e.preventDefault()

    const next = !isWatching
    setIsWatching(next)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    const wl = getWatchlist()
    if (next) wl.add(marketId)
    else      wl.delete(marketId)
    setWatchlist(wl)
  }

  const starColor   = isWatching ? 'var(--probex-warning)' : 'var(--probex-text-muted)'
  const iconSize    = size === 'sm' ? 13 : 15

  if (variant === 'pill') {
    return (
      <button
        onClick={toggle}
        type="button"
        aria-label={isWatching ? 'Remove from watchlist' : 'Add to watchlist'}
        aria-pressed={isWatching}
        className={cn(
          'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md cursor-pointer transition-all duration-150',
          isAnimating && 'scale-95',
          className,
        )}
        style={isWatching ? {
          background:  'rgba(245,158,11,0.1)',
          color:       'var(--probex-warning)',
          border:      '1px solid rgba(245,158,11,0.25)',
        } : {
          background:  'var(--probex-surface-2)',
          color:       'var(--probex-text-secondary)',
          border:      '1px solid var(--probex-border)',
        }}
        onMouseEnter={(e) => {
          if (!isWatching) e.currentTarget.style.borderColor = 'var(--probex-border-strong)'
        }}
        onMouseLeave={(e) => {
          if (!isWatching) e.currentTarget.style.borderColor = 'var(--probex-border)'
        }}
      >
        <StarIcon size={iconSize} filled={isWatching} color={starColor} />
        {isWatching ? 'Watchlisted' : 'Watchlist'}
      </button>
    )
  }

  // Icon-only variant
  return (
    <button
      onClick={toggle}
      type="button"
      aria-label={isWatching ? 'Remove from watchlist' : 'Add to watchlist'}
      aria-pressed={isWatching}
      className={cn(
        'flex items-center justify-center rounded cursor-pointer transition-all duration-150',
        size === 'sm' ? 'w-6 h-6' : 'w-7 h-7',
        isAnimating && 'scale-90',
        className,
      )}
      style={{
        background: isWatching ? 'rgba(245,158,11,0.1)' : 'transparent',
        color:      starColor,
      }}
      onMouseEnter={(e) => {
        if (!isWatching) e.currentTarget.style.color = 'var(--probex-text-secondary)'
      }}
      onMouseLeave={(e) => {
        if (!isWatching) e.currentTarget.style.color = 'var(--probex-text-muted)'
      }}
    >
      <StarIcon size={iconSize} filled={isWatching} color={starColor} />
    </button>
  )
}

// ─── Star SVG ─────────────────────────────────────────────────────────────

function StarIcon({ size, filled, color }: { size: number; filled: boolean; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transition: 'fill 0.15s, color 0.15s' }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}
