import type { Metadata } from 'next'
import { MarketsView }   from '@/components/markets/MarketsView'

export const metadata: Metadata = {
  title:       'Markets',
  description: 'Discover prediction markets powered by the Probex Consensus Engine.',
}

/**
 * Markets discovery page — /dashboard/markets
 *: Full market discovery with filtering, search, and navigation to detail.
 */
export default function MarketsPage() {
  return <MarketsView />
}
