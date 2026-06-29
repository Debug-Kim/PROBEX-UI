'use client'

// Watchlist dashboard. Persists via useWatchlist() (sessionStorage, shared with
// WatchlistButton) and resolves data from MOCK_MARKETS / MOCK_CONSENSUS_MAP.
// View/sort/filter state is local (useState) — deliberately not in marketStore, so
// the page stays decoupled from Markets.

import Link                       from 'next/link'
import { useMemo, useState }      from 'react'
import { formatCompact }          from '@/lib/utils'
import { PageHeader }             from '@/components/ui/PageHeader'
import { StatCard }               from '@/components/ui/StatCard'
import { EmptyState }             from '@/components/ui/EmptyState'
import { useWatchlist }           from '@/hooks/useWatchlist'
import { services }              from '@/lib/services'
import { ORDERED_SEGMENTS }       from '@/config/marketSegments'
import { ROUTES }                 from '@/config/constants'
import { WatchlistCard }          from './WatchlistCard'
import { WatchlistTable }         from './WatchlistTable'
import type { Market }            from '@/types/market'
import type { ConsensusState }    from '@/types/consensus'
import type { BitcoinSegment }    from '@/types/market'

type SortField = 'added' | 'consensus' | 'probability' | 'volume24h' | 'closesAt'
type ViewMode  = 'grid' | 'table'

interface WatchedItem {
  market:     Market
  consensus:  ConsensusState | undefined
  addedIndex: number
}

const SORT_OPTIONS: Array<{ field: SortField; label: string }> = [
  { field: 'added',       label: 'Recently Added' },
  { field: 'consensus',   label: 'Consensus' },
  { field: 'probability', label: 'Probability' },
  { field: 'volume24h',   label: 'Volume' },
  { field: 'closesAt',    label: 'Closing Date' },
]

export function WatchlistView() {
  const { ids, count, isHydrated, remove, clear } = useWatchlist()

  // Local UI state — self-contained, not shared with the Markets page.
  const [search, setSearch]     = useState('')
  const [segment, setSegment]   = useState<BitcoinSegment | null>(null)
  const [sortBy, setSortBy]     = useState<SortField>('added')
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // ── Resolve watched markets from mock sources ──────────────────────────────
  const watched = useMemo<WatchedItem[]>(() => {
    const out: WatchedItem[] = []
    ids.forEach((id, index) => {
      const market = services.markets.peekMarket?.(id)
      if (!market) return
      out.push({ market, consensus: services.consensus.peekConsensus?.(id) ?? undefined, addedIndex: index })
    })
    return out
  }, [ids])

  // ── Performance metrics (over the full watched set, pre-filter) ────────────
  const metrics = useMemo(() => {
    if (watched.length === 0) return null
    const scores = watched
      .map((w) => w.consensus?.score)
      .filter((s): s is number => s !== undefined)
    const avgConsensus = scores.length
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)
      : 0
    const avgProbability = Math.round(
      (watched.reduce((s, w) => s + w.market.probability, 0) / watched.length) * 100,
    )
    const strongSignals = watched.filter((w) => w.consensus?.signalStrength === 'strong').length
    const totalVolume   = watched.reduce((s, w) => s + w.market.volume24h, 0)
    return { count: watched.length, avgConsensus, avgProbability, strongSignals, totalVolume }
  }, [watched])

  // ── Filter + sort pipeline ─────────────────────────────────────────────────
  const filtered = useMemo<WatchedItem[]>(() => {
    let list = watched
    if (segment) list = list.filter((w) => w.market.segment === segment)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((w) =>
        w.market.title.toLowerCase().includes(q) ||
        w.market.description.toLowerCase().includes(q) ||
        w.market.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    const dir = sortDir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'consensus':   return ((a.consensus?.score ?? 0) - (b.consensus?.score ?? 0)) * dir
        case 'probability': return (a.market.probability - b.market.probability) * dir
        case 'volume24h':   return (a.market.volume24h - b.market.volume24h) * dir
        case 'closesAt':    return (new Date(a.market.closesAt).getTime() - new Date(b.market.closesAt).getTime()) * dir
        case 'added':
        default:            return (a.addedIndex - b.addedIndex) * dir
      }
    })
  }, [watched, segment, search, sortBy, sortDir])

  const hasActiveFilters = search.trim() !== '' || segment !== null

  const clearFilters = () => { setSearch(''); setSegment(null) }

  // ── Render: pre-hydration (avoid empty-state flash) ────────────────────────
  if (!isHydrated) {
    return (
      <div className="page-container">
        <PageHeader title="Watchlist" subtitle="Markets you're following closely" />
      </div>
    )
  }

  // ── Render: empty watchlist ────────────────────────────────────────────────
  if (count === 0) {
    return (
      <div className="page-container">
        <PageHeader title="Watchlist" subtitle="Markets you're following closely" />
        <EmptyState
          size="lg"
          icon={<StarGlyph />}
          title="Your watchlist is empty"
          description="Add markets from the Markets page by clicking the star icon on any market card or table row."
          action={
            <Link href={ROUTES.MARKETS} className="btn-primary" style={{ display: 'inline-block' }}>
              Browse Markets
            </Link>
          }
        />
      </div>
    )
  }

  // ── Render: populated dashboard ────────────────────────────────────────────
  return (
    <div className="page-container flex flex-col gap-5 pb-8">
      <PageHeader
        title="Watchlist"
        subtitle={`${count} market${count === 1 ? '' : 's'} you're following closely`}
        actions={
          <button
            onClick={clear}
            className="text-xs font-medium px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-100"
            style={{ background: 'var(--probex-surface-2)', color: 'var(--probex-text-secondary)', border: '1px solid var(--probex-border-default)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--probex-negative)'; e.currentTarget.style.borderColor = 'var(--probex-negative)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--probex-text-secondary)'; e.currentTarget.style.borderColor = 'var(--probex-border-default)' }}
          >
            Clear all
          </button>
        }
      />

      {/* ── Performance metrics ─────────────────────────────────────────── */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          <StatCard label="Watching"        value={String(metrics.count)} deltaLabel={`across ${services.markets.peekMarkets?.()?.total ?? 0} markets`} />
          <StatCard label="Avg Consensus"   value={`${metrics.avgConsensus}%`}   valueColor="var(--probex-primary)" />
          <StatCard label="Avg Probability" value={`${metrics.avgProbability}%`} />
          <StatCard label="Strong Signals"  value={String(metrics.strongSignals)} valueColor="var(--probex-positive)" />
          <StatCard label="24h Volume"      value={`$${formatCompact(metrics.totalVolume)}`} />
        </div>
      )}

      {/* ── Controls ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" aria-hidden="true"
              style={{ color: 'var(--probex-text-muted)' }}
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your watchlist…"
              className="input-base h-8 pl-8 pr-3 text-sm w-full"
              aria-label="Search watchlist"
            />
          </div>

          {/* Segment filter */}
          <SelectControl
            ariaLabel="Filter by segment"
            value={segment ?? 'all'}
            onChange={(v) => setSegment(v === 'all' ? null : (v as BitcoinSegment))}
            options={[
              { value: 'all', label: 'All Segments' },
              ...ORDERED_SEGMENTS.map((s) => ({ value: s.id, label: s.label })),
            ]}
          />

          {/* Sort field */}
          <SelectControl
            ariaLabel="Sort by"
            value={sortBy}
            onChange={(v) => setSortBy(v as SortField)}
            options={SORT_OPTIONS.map((o) => ({ value: o.field, label: o.label }))}
          />

          {/* Sort direction */}
          <button
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            aria-label={`Sort ${sortDir === 'asc' ? 'ascending' : 'descending'}`}
            className="flex items-center justify-center w-8 h-8 rounded-md cursor-pointer transition-colors duration-100 flex-shrink-0"
            style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)', color: 'var(--probex-text-secondary)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
              style={{ transform: sortDir === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </button>

          {/* View toggle */}
          <div className="flex rounded-md overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--probex-border-default)' }} role="group" aria-label="View mode">
            {(['grid', 'table'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                aria-pressed={viewMode === m}
                aria-label={`${m} view`}
                className="flex items-center justify-center w-8 h-8 cursor-pointer transition-colors duration-100"
                style={{
                  background:  viewMode === m ? 'var(--probex-primary-dim)' : 'transparent',
                  color:        viewMode === m ? 'var(--probex-primary)' : 'var(--probex-text-muted)',
                  borderRight:  m === 'grid' ? '1px solid var(--probex-border-default)' : 'none',
                }}
              >
                {m === 'grid' ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-100 flex-shrink-0"
              style={{ background: 'var(--probex-negative-dim)', color: 'var(--probex-negative)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              Clear
            </button>
          )}
        </div>

        <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>
          Showing {filtered.length} of {count}
        </span>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No markets match your filters"
          description="Try adjusting your search or segment filter."
          action={
            <button onClick={clearFilters} className="btn-primary" style={{ display: 'inline-block' }}>
              Clear filters
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((w) => (
            <WatchlistCard key={w.market.id as string} market={w.market} consensus={w.consensus} onRemove={remove} />
          ))}
        </div>
      ) : (
        <WatchlistTable items={filtered} onRemove={remove} />
      )}
    </div>
  )
}

// ─── Select control ─────────────────────────────────────────────────────────

function SelectControl({
  value, onChange, options, ariaLabel,
}: {
  value:     string
  onChange:  (v: string) => void
  options:   Array<{ value: string; label: string }>
  ariaLabel: string
}) {
  return (
    <div className="relative flex-shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="h-8 pl-2.5 pr-6 text-xs rounded-md cursor-pointer appearance-none transition-colors duration-100"
        style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)', color: 'var(--probex-text-secondary)', minWidth: '120px' }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
        style={{ color: 'var(--probex-text-muted)' }}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

// ─── Empty-state glyph ──────────────────────────────────────────────────────

function StarGlyph() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
