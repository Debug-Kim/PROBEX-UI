import type { Metadata } from 'next'
import { AnalyticsOverview } from '@/components/analytics'
import { ANALYTICS_DASHBOARD } from '@/mock/analytics'

export const metadata: Metadata = {
  title: 'Analytics — Probex',
  description: 'Deep market analytics: consensus trends, ETF flows, on-chain signals, and institutional positioning.',
}

export default function AnalyticsPage() {
  return <AnalyticsOverview data={ANALYTICS_DASHBOARD} />
}
