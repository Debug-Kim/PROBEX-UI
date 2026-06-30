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
