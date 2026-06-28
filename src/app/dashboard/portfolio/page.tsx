import type { Metadata } from 'next'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'

export const metadata: Metadata = {
  title:       'Portfolio — Probex',
  description: 'Track positions, performance, exposure, and Consensus Engine alignment.',
}

/**
 * Portfolio page — /dashboard/portfolio
 * Full portfolio experience with positions, performance charts,
 * allocation breakdowns, and Consensus Engine accuracy tracking.
 *
 * All data is sourced from mock/positions.ts, mock/portfolio.ts, and
 * mock/performance.ts. replace with IPortfolioService.
 */
export default function Page() {
  return <PortfolioPage />
}
