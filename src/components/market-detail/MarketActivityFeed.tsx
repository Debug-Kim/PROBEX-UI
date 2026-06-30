'use client'

/**
 * MarketActivityFeed
 *
 * Prepends live trade/activity events from liveStore.liveActivity so the
 * feed scrolls upward in real time as the market trades.
 *
 * Integration:
 *   - Static activity from mock/marketActivity.ts remains as the base tail
 *   - Live events for this specific marketId are prepended at the top
 *   - Bounded: only the most recent MAX_LIVE = 15 live events shown above static
 * - When ENABLE_REALTIME_MARKETS is false: renders identically to
 *
 */

import { useMemo } from 'react'
import { useLiveStore } from '@/store/liveStore'
import { useMarketActivity } from '@/hooks/useServices'
import { FEATURES } from '@/config/features'
import { LiveIndicator } from '@/components/live/LiveIndicator'
import type { MarketId } from '@/types/branded'

const MAX_LIVE_EVENTS = 15
const MAX_STATIC_EVENTS = 20

interface MarketActivityFeedProps {
  marketId: MarketId
}

// ── Activity item renderers ────────────────────────────────────────────────────

interface ActivityItem {
  id: string
  summary: string
  ts: number
  isLive?: boolean
  type: 'trade' | 'position_open' | 'position_close' | 'market_created' | 'static'
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return `${Math.max(1, Math.floor(diff / 1000))}s ago`
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return new Date(ts).toLocaleDateString()
}

function itemDotColor(type: ActivityItem['type']): string {
  switch (type) {
    case 'trade':
      return 'var(--probex-yes)'
    case 'position_open':
      return 'var(--probex-primary)'
    case 'position_close':
      return 'var(--probex-text-muted)'
    default:
      return 'var(--probex-border-active)'
  }
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '8px 0',
        borderBottom: '1px solid var(--probex-border)',
      }}
    >
      {/* Dot */}
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: itemDotColor(item.type),
          flexShrink: 0,
          marginTop: 4,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'var(--probex-text-primary)',
            lineHeight: 1.4,
          }}
        >
          {item.summary}
          {item.isLive && (
            <span
              aria-label="Live event"
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: 'var(--probex-yes)',
                marginLeft: 6,
                verticalAlign: 'middle',
              }}
            />
          )}
        </p>
        <p
          style={{
            margin: '2px 0 0',
            fontSize: 10,
            color: 'var(--probex-text-muted)',
          }}
        >
          {formatRelativeTime(item.ts)}
        </p>
      </div>
    </li>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MarketActivityFeed({ marketId }: MarketActivityFeedProps) {
  const liveActivity = useLiveStore((s) => s.liveActivity)
  const rawActivity  = useMarketActivity(marketId as string, MAX_STATIC_EVENTS).data ?? []

  const staticActivity = useMemo(
    () => rawActivity.slice(0, MAX_STATIC_EVENTS),
    [rawActivity],
  )

 // Live events filtered to this market
  const liveItems = useMemo<ActivityItem[]>(() => {
    if (!FEATURES.ENABLE_REALTIME_MARKETS) return []
    return liveActivity
      .filter((e) => e.marketId === marketId || e.marketId === '')
      .slice(0, MAX_LIVE_EVENTS)
      .map((e) => ({
        id: e.id,
        summary: e.summary,
        ts: e.ts,
        isLive: true,
        type: e.type,
      }))
  }, [liveActivity, marketId])

  // Static items cast to ActivityItem
  const staticItems = useMemo<ActivityItem[]>(
    () =>
      staticActivity.map((a, i) => ({
        id: `static-${i}`,
        summary: a.summary ?? a.description ?? 'Market activity',
        ts: a.ts ?? Date.now() - i * 120_000,
        isLive: false,
        type: 'static',
      })),
    [staticActivity],
  )

  const allItems = [...liveItems, ...staticItems]

  return (
    <div
      style={{
        borderTop: '1px solid var(--probex-border)',
        padding: '12px 20px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        maxHeight: 280,
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 4,
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--probex-surface)',
          paddingBottom: 4,
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'var(--probex-text-muted)',
          }}
        >
          Activity
        </span>
        {liveItems.length > 0 && (
 <LiveIndicator variant="dot" />
        )}
      </div>

      {allItems.length === 0 ? (
        <p
          style={{
            fontSize: 12,
            color: 'var(--probex-text-muted)',
            padding: '16px 0',
          }}
        >
          No activity yet.
        </p>
      ) : (
        <ul
          role="feed"
          aria-live="polite"
          aria-label="Market activity feed"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {allItems.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  )
}
