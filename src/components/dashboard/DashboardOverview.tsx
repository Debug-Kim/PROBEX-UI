'use client'

// Main landing screen for authenticated users.
// .5: Hero Carousel added as primary visual centerpiece.
//
// Layout (top → bottom):
//   1. Global Consensus Bar    — compact 5-stat strip
//   2. Hero Market Carousel    — rotating featured market intelligence
//   3. Featured Markets Grid   — 6 consensus-driven cards
//   4. Trending Markets Table  — sortable, compact
//   5. Recent Activity Feed    — sidebar (right on xl+)
//   6. Footer

import { useMemo }                                      from 'react'
import { useRouter }                                    from 'next/navigation'
import { useMarkets, useConsensusMap }                  from '@/hooks/useServices'
import type { Market }                                  from '@/types/market'
import type { ConsensusState }                          from '@/types/consensus'
import { GlobalConsensusBar }                           from './GlobalConsensusBar'
import { ActivityFeed }                                 from './ActivityFeed'
import { HeroCarousel }                                 from './HeroCarousel'
import { MarketCard }                                   from '@/components/markets/MarketCard'
import { MarketTable }                                  from '@/components/markets/MarketTable'
import { Footer }                                       from '@/components/layout/Footer'
import { ROUTES }                                       from '@/config/constants'

export function DashboardOverview() {
  const router       = useRouter()
  const allMarkets   = useMarkets().data?.data ?? []
  const consensusMap = useConsensusMap().data ?? {}
  const featured     = useMemo(() => [...allMarkets].sort((a, b) => b.liquidity - a.liquidity).slice(0, 6), [allMarkets])
  const trending     = useMemo(() => [...allMarkets].sort((a, b) => b.volume24h - a.volume24h).slice(0, 8), [allMarkets])

  const handleMarketClick = (m: Market) => {
    router.push(`${ROUTES.MARKETS}/${m.id as string}`)
  }

  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>

      {/* Page landmark for screen readers — the overview leads with the consensus
          bar + hero rather than a visible title row. */}
      <h1 className="sr-only">Dashboard overview</h1>

      {/* 1. Global Consensus Bar */}
      <GlobalConsensusBar />

      {/* Main grid: content + activity sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, marginTop: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>

          {/* Left column */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* 2. Hero Carousel */}
            <section>
              <HeroCarousel />
            </section>

            {/* 3. Featured Markets */}
            <section>
              <SectionHeader
                title="Featured Markets"
                subtitle="Highest consensus confidence"
                action={{ label: 'All markets →', href: ROUTES.MARKETS }}
              />
              <FeaturedGrid markets={featured} consensusMap={consensusMap} onMarketClick={handleMarketClick} />
            </section>

            {/* 4. Trending Markets */}
            <section>
              <SectionHeader
                title="Trending Now"
                subtitle="Sorted by 24h volume"
                action={{ label: 'See all →', href: ROUTES.MARKETS }}
              />
              <MarketTable
                markets={trending}
                consensusMap={consensusMap}
                onMarketClick={handleMarketClick}
              />
            </section>
          </div>

          {/* Right column: Activity Feed */}
          <aside className="hidden xl:flex" style={{ width: 280, flexShrink: 0 }}>
            <ActivityFeed className="flex-1 max-h-[680px] sticky top-5" />
          </aside>
        </div>
      </div>

      {/* 6. Footer */}
      <Footer />
    </div>
  )
}

// ─── Featured Markets Grid ─────────────────────────────────────────────────

function FeaturedGrid({
  markets,
  consensusMap,
  onMarketClick,
}: {
  markets:       Market[]
  consensusMap:  Record<string, ConsensusState>
  onMarketClick: (m: Market) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {markets.flatMap((market) => {
        const consensus = consensusMap[market.id as string]
        if (!consensus) return []
        return [(
          <MarketCard
            key={market.id as string}
            market={market}
            consensus={consensus}
            variant="featured"
            onClick={onMarketClick}
          />
        )]
      })}
    </div>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title:    string
  subtitle?: string
  action?:  { label: string; href: string }
}

function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  const router = useRouter()
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--probex-text-primary)' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--probex-text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <button
          onClick={() => router.push(action.href)}
          className="text-xs cursor-pointer transition-opacity duration-150 hover:opacity-100"
          style={{ color: 'var(--probex-primary)', opacity: 0.8 }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
