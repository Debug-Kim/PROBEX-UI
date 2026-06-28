'use client'

import { useState, useMemo }    from 'react'
import { useRouter }             from 'next/navigation'
import { cn }                    from '@/lib/utils'
import { getRelatedMarkets }     from '@/mock/marketDetails'
import {
  MOCK_MARKETS,
  getMarketsBySegment,
  getTrendingMarkets,
} from '@/mock/markets'
import { MOCK_CONSENSUS_MAP }    from '@/mock/consensus'
import type { Market }           from '@/types/market'
import type { BitcoinSegment }   from '@/types/market'
import { MarketCard }            from '@/components/markets/MarketCard'
import { ROUTES }                from '@/config/constants'

interface RelatedMarketsProps {
  marketId:    string
  segment:     BitcoinSegment
  consensus?:  number   // current market consensus score 0–1
  className?:  string
}

type RelatedTab = 'similar' | 'segment' | 'trending'

const TABS: Array<{ id: RelatedTab; label: string }> = [
  { id: 'similar',  label: 'Similar Markets' },
  { id: 'segment',  label: 'Same Segment'    },
  { id: 'trending', label: 'Trending'        },
]

/**
 * RelatedMarkets
 * ──────────────
 * Three-tab panel showing related markets on the detail page.
 * Uses compact MarketCard variant to maintain information density.
 *
 * Tabs:
 *   Similar    — curated related markets from mock marketDetails.ts
 *   Segment    — other markets in the same Bitcoin segment
 *   Trending   — highest 24h volume markets platform-wide
 *
 * replace with IMarketService.getRelatedMarkets API call.
 */
export function RelatedMarkets({
  marketId,
  segment,
  consensus: _consensus,
  className,
}: RelatedMarketsProps) {
  const [activeTab, setActiveTab] = useState<RelatedTab>('similar')
  const router = useRouter()

  const similarMeta = useMemo(() => getRelatedMarkets(marketId), [marketId])

  const markets = useMemo((): Market[] => {
    switch (activeTab) {
      case 'similar': {
        // Resolve RelatedMarket stubs to full Market objects
        return similarMeta
          .map((rm) => MOCK_MARKETS.find((m) => m.id === rm.id))
          .filter((m): m is Market => m !== undefined)
          .filter((m) => m.id !== marketId)
          .slice(0, 4)
      }
      case 'segment': {
        return getMarketsBySegment(segment)
          .filter((m) => m.id !== marketId)
          .slice(0, 4)
      }
      case 'trending': {
        return getTrendingMarkets(5)
          .filter((m) => m.id !== marketId)
          .slice(0, 4)
      }
    }
  }, [activeTab, marketId, segment, similarMeta])

  const handleClick = (market: Market) => {
    router.push(`${ROUTES.MARKETS}/${market.id}`)
  }

  return (
    <div
      className={cn('rounded-xl overflow-hidden', className)}
      style={{
        background: 'var(--probex-surface)',
        border:     '1px solid var(--probex-border)',
      }}
    >
      {/* Header + Tabs */}
      <div style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <div className="px-4 pt-3 pb-0">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--probex-text-primary)' }}>
            Related Markets
          </h2>
          <div className="flex" role="tablist" aria-label="Related markets tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="text-xs font-medium px-3 py-2 cursor-pointer transition-colors duration-100 whitespace-nowrap"
                style={{
                  color:        activeTab === tab.id ? 'var(--probex-primary)' : 'var(--probex-text-muted)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--probex-primary)' : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Market list */}
      <div className="p-3">
        {markets.length === 0 ? (
          <div
            className="py-8 flex flex-col items-center gap-2"
            style={{ color: 'var(--probex-text-muted)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
            </svg>
            <p className="text-xs">No related markets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {markets.map((market) => (
              <MarketCard
                key={market.id as string}
                market={market}
                consensus={MOCK_CONSENSUS_MAP[market.id as string]!}
                variant="grid"
                onClick={handleClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
