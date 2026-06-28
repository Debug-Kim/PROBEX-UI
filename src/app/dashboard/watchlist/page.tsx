import type { Metadata } from 'next'
import { WatchlistView }  from '@/components/watchlist/WatchlistView'

export const metadata: Metadata = {
  title: 'Watchlist — Probex',
  description: 'Markets you are watching closely.',
}

export default function WatchlistPage() {
  return <WatchlistView />
}
