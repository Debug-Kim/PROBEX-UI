'use client'

/**
 * ConsensusResearch
 * ─────────────────
 * Research-layer integration: surfaces intelligence reports relevant to the
 * selected market/segment, reusing the existing ResearchReportCard. Opening a
 * report routes into the Research terminal (no reader logic duplicated).
 */

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AnalyticsCard } from '@/components/analytics/shared'
import { ResearchReportCard } from '@/components/research/ResearchReportCard'
import { MOCK_RESEARCH_REPORTS } from '@/mock/research'
import { getSegmentMeta } from '@/config/marketSegments'
import { ROUTES } from '@/config/constants'
import type { BitcoinSegment } from '@/types/market'

export function ConsensusResearch({ marketId, segment }: { marketId: string; segment: BitcoinSegment }) {
  const router = useRouter()

  const reports = useMemo(() => {
    const matches = MOCK_RESEARCH_REPORTS.filter(
      (r) => r.featuredMarkets.includes(marketId) || r.relevantSegments.includes(segment),
    )
    return (matches.length > 0 ? matches : MOCK_RESEARCH_REPORTS).slice(0, 4)
  }, [marketId, segment])

  return (
    <AnalyticsCard
      title="Related Research"
      subtitle={`Intelligence reports · ${getSegmentMeta(segment).label}`}
      right={
        <button
          type="button"
          onClick={() => router.push(ROUTES.RESEARCH)}
          className="text-2xs font-semibold px-2 py-1 rounded-md cursor-pointer"
          style={{ color: 'var(--probex-primary)', border: '1px solid var(--probex-border-default)' }}
        >
          View all
        </button>
      }
    >
      <div className="flex flex-col">
        {reports.map((r) => (
          <ResearchReportCard
            key={r.id as string}
            report={r}
            variant="compact"
            onClick={() => router.push(ROUTES.RESEARCH)}
          />
        ))}
      </div>
    </AnalyticsCard>
  )
}
