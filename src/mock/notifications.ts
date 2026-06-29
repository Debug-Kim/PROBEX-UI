// Drives the Notification Center until a real notification service ships.
// Shapes mirror platform events (consensus shifts, resolutions, research).

import { ROUTES, MARKET_DETAIL_PATH } from '@/config/constants'

export type NotificationKind = 'consensus' | 'resolution' | 'price' | 'research' | 'system'

export interface NotificationItem {
  id:        string
  kind:      NotificationKind
  title:     string
  body:      string
  timestamp: number
  read:      boolean
  href:      string
}

const now = Date.now()

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'ntf-1', kind: 'consensus',  title: 'Consensus shift',     body: 'BTC > $150K by Dec 2026 consensus rose to 91%.',           timestamp: now - 120_000,   read: false, href: MARKET_DETAIL_PATH('btc-150k-dec-2026') },
  { id: 'ntf-2', kind: 'price',      title: 'Probability spike',   body: 'BTC ETF inflows market jumped +6% in the last hour.',       timestamp: now - 900_000,   read: false, href: ROUTES.LIVE },
  { id: 'ntf-3', kind: 'research',   title: 'New research',        body: 'Q3 Outlook: Institutional Absorption Meets Supply Shock.',  timestamp: now - 3_600_000, read: false, href: ROUTES.RESEARCH },
  { id: 'ntf-4', kind: 'resolution', title: 'Market resolved',     body: 'A market in your watchlist resolved YES.',                  timestamp: now - 7_200_000, read: true,  href: ROUTES.PORTFOLIO },
  { id: 'ntf-5', kind: 'system',     title: 'Engine update',       body: 'QUBO Consensus Engine v2 latency improved to <90ms.',       timestamp: now - 86_400_000, read: true, href: ROUTES.CONSENSUS },
]

export const NOTIFICATION_META: Record<NotificationKind, { icon: string; color: string }> = {
  consensus:  { icon: '◈', color: 'var(--probex-primary)'  },
  resolution: { icon: '✓', color: 'var(--probex-positive)' },
  price:      { icon: '⚡', color: 'var(--probex-warning)'  },
  research:   { icon: '✦', color: 'var(--probex-chart-secondary)' },
  system:     { icon: '⚙', color: 'var(--probex-text-muted)' },
}
