'use client'

import { useMemo, useState }     from 'react'
import { cn }                    from '@/lib/utils'
import { usePositions, usePositionConsensus } from '@/hooks/useServices'
import { usePortfolioStore }     from '@/store/portfolioStore'
import { PositionFilters, type PnlState } from './PositionFilters'
import { PositionTable }         from './PositionTable'
import { PositionDetails }       from './PositionDetails'
import type { AlignmentType }    from '@/lib/positions/alignment'

interface OpenPositionsProps {
  className?: string
}

/**
 * OpenPositions
 * ─────────────
 * Full open-positions workflow: filters → table → detail panel.
 *
 * Filtering pipeline (all client-side against mock data):
 *   1. Side filter        (portfolioStore.sideFilter)
 *   2. Segment filter      (portfolioStore.segmentFilter)
 *   3. Search              (portfolioStore.positionSearch)
 *   4. P&L state            (local component state)
 *   5. Consensus alignment  (local component state)
 *   6. Sort                 (portfolioStore.sortBy / sortDir)
 *
 * Selecting a row opens PositionDetails below the table.
 */
export function OpenPositions({ className }: OpenPositionsProps) {
  const [pnlState, setPnlState]             = useState<PnlState>(null)
  const [alignmentState, setAlignmentState] = useState<AlignmentType | null>(null)

  const { sideFilter, segmentFilter, positionSearch, sortBy, sortDir, isDetailPanelOpen, selectedPositionId } = usePortfolioStore()

  const openPositions     = usePositions('open').data ?? []
  const positionConsensus = usePositionConsensus()

  const filtered = useMemo(() => {
    let result = [...openPositions]

    if (sideFilter)    result = result.filter((p) => p.side === sideFilter)
    if (segmentFilter) result = result.filter((p) => p.segment === segmentFilter)

    if (positionSearch.trim()) {
      const q = positionSearch.toLowerCase()
      result  = result.filter((p) => p.marketTitle.toLowerCase().includes(q))
    }

    if (pnlState) {
      result = result.filter((p) => pnlState === 'profit' ? p.unrealizedPnl >= 0 : p.unrealizedPnl < 0)
    }

    if (alignmentState) {
      result = result.filter((p) => positionConsensus(p).alignment === alignmentState)
    }

    result.sort((a, b) => {
      let valA: number | string
      let valB: number | string
      switch (sortBy) {
        case 'marketTitle':       valA = a.marketTitle; valB = b.marketTitle; break
        case 'unrealizedPnlPct':  valA = a.unrealizedPnlPct; valB = b.unrealizedPnlPct; break
        case 'currentValue':      valA = a.currentValue; valB = b.currentValue; break
        case 'costBasis':         valA = a.costBasis; valB = b.costBasis; break
        case 'openedAt':          valA = new Date(a.openedAt).getTime(); valB = new Date(b.openedAt).getTime(); break
        case 'side':              valA = a.side; valB = b.side; break
        default:                  valA = a.unrealizedPnl; valB = b.unrealizedPnl
      }
      if (typeof valA === 'string' || typeof valB === 'string') {
        const cmp = String(valA).localeCompare(String(valB))
        return sortDir === 'desc' ? -cmp : cmp
      }
      return sortDir === 'desc' ? (valB as number) - (valA as number) : (valA as number) - (valB as number)
    })

    return result
  }, [openPositions, positionConsensus, sideFilter, segmentFilter, positionSearch, pnlState, alignmentState, sortBy, sortDir])

  return (
    <div className={cn('flex flex-col gap-3', className)}>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold" style={{ color: 'var(--probex-text-primary)' }}>
          Open Positions
        </h2>
        <span
          className="text-xs px-2.5 py-1 rounded-md font-medium"
          style={{ background: 'var(--probex-primary-dim)', color: 'var(--probex-primary)', border: '1px solid var(--probex-yes-border)' }}
        >
          {filtered.length} of {openPositions.length}
        </span>
      </div>

      <PositionFilters
        pnlState={pnlState}
        onPnlChange={setPnlState}
        alignmentState={alignmentState}
        onAlignmentChange={setAlignmentState}
      />

      <PositionTable positions={filtered} isSettled={false} />

      {isDetailPanelOpen && selectedPositionId && (
        <PositionDetails />
      )}
    </div>
  )
}
