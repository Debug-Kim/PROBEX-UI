import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { getMarketById } from '@/mock/markets'
import { MOCK_CONSENSUS_MAP } from '@/mock/consensus'
import { MarketDetailPage }   from '@/components/market-detail/MarketDetailPage'

// ─── Params type ───────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ marketId: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { marketId } = await params
  const market = getMarketById(decodeURIComponent(marketId))

  if (!market) {
    return { title: 'Market Not Found — Probex' }
  }

  return {
    title:       `${market.title} — Probex`,
    description: market.description,
    openGraph: {
      title:       market.title,
      description: `Probability: ${Math.round(market.probability * 100)}% · Consensus: ${Math.round((MOCK_CONSENSUS_MAP[market.id as string]?.score ?? 0) * 100)}%`,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────

/**
 * Market Detail Page
 * ───────────────────
 * Route: /dashboard/markets/[marketId]
 *
 * Resolves the market from mock data, passing `notFound()` for unknown IDs.
 *
 * replace getMarketById with server-side IMarketService call,
 *           enabling streaming + incremental static regeneration.
 *
 * Architecture note: this is a Server Component — it resolves data
 * at request time. MarketDetailPage is a Client Component that handles
 * all interactive state (trading drawer, watchlist, store sync).
 */
export default async function MarketDetailRoutePage({ params }: PageProps) {
  const { marketId } = await params
  const decodedId    = decodeURIComponent(marketId)
  const market       = getMarketById(decodedId)

  if (!market) {
    notFound()
  }


  return (
    <MarketDetailPage
      marketId={decodedId}
    />
  )
}

// ─── Generate static params (optional, enables static pre-rendering) ───────
// Only included for completeness — not required in development mode.

export function generateStaticParams() {
 // In production, pre-render the top 20 markets by liquidity.
  // For now, return empty to use dynamic rendering.
  return []
}
