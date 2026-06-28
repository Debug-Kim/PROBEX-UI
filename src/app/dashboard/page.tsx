import type { Metadata } from 'next'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'

export const metadata: Metadata = {
  title: 'Overview',
  description: 'Real-time Bitcoin prediction intelligence. Consensus-driven market discovery.',
}

/**
 * Dashboard Overview page — /dashboard
 * Kalshi-style market discovery experience.
 * No hero bloat — immediate market value.
 */
export default function DashboardPage() {
  return <DashboardOverview />
}
