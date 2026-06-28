'use client'

import {useMemo, useState}    from 'react'
import {cn}   from '@/lib/utils'
import {MOCK_SETTLED_POSITIONS} from '@/mock/positions'
import {getPositionConsensus} from '@/mock/positionConsensus'
import {usePortfolioStore}    from '@/store/portfolioStore'
import {PositionFilters, type PnlState} from './PositionFilters'
import {PositionTable}        from './PositionTable'
import type { AlignmentType }   from '@/mock/positionConsensus'

interface SettledPositionsProps {
  className?: string
}

/**
 * SettledPositions
 * ────────────────
 * Resolved positions with win/loss breakdown and consensus accuracy summary.
 *
 * Consensus accuracy: of all settled positions where the consensus engine
 * was 'aligned' with the position's side, what fraction ended up WIN?
 * This is the headline "how accurate has consensus been?" metric.
 */
export function SettledPositions({ className }: SettledPositionsProps) {
  const [pnlState, setPnlState]             = useState<PnlState>(null)
  const [alignmentState, setAlignmentState] = useState<AlignmentType | null>(null)

  const { sideFilter, segmentFilter, positionSearch, sortBy, sortDir } = usePortfolioStore()

  const filtered = useMemo(() => {
    let result = [...MOCK_SETTLED_POSITIONS]

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
      result = result.filter((p) => getPositionConsensus(p).alignment === alignmentState)
    }

    result.sort((a, b) => {
      let valA: number | string
      let valB: number | string
      switch (sortBy) {
        case 'marketTitle': valA = a.marketTitle; valB = b.marketTitle; break
        case 'costBasis':   valA = a.costBasis; valB = b.costBasis; break
        case 'side':        valA = a.side; valB = b.side; break
        case 'openedAt':    valA = new Date(a.closedAt ?? a.openedAt).getTime(); valB = new Date(b.closedAt ?? b.openedAt).getTime(); break
        default:            valA = a.unrealizedPnl; valB = b.unrealizedPnl
      }
      if (typeof valA === 'string' || typeof valB === 'string') {
        const cmp = String(valA).localeCompare(String(valB))
        return sortDir === 'desc' ? -cmp : cmp
      }
      return sortDir === 'desc' ? (valB as number) - (valA as number) : (valA as number) - (valB as number)
    })

    return result
  }, [sideFilter, segmentFilter, positionSearch, pnlState, alignmentState, sortBy, sortDir])

  // ── Consensus accuracy ─────────────────────────────────────────────────
  const accuracy = useMemo(() => {
    let alignedAndWon = 0
    let alignedTotal  = 0
    for (const pos of MOCK_SETTLED_POSITIONS) {
      const { alignment } = getPositionConsensus(pos)
      if (alignment === 'aligned') {
        alignedTotal++
        if (pos.status === 'settled-win') alignedAndWon++
      }
    }
    return alignedTotal > 0 ? alignedAndWon / alignedTotal : null
  }, [])

  const wins   = MOCK_SETTLED_POSITIONS.filter((p) => p.status === 'settled-win').length
  const losses = MOCK_SETTLED_POSITIONS.filter((p) => p.status === 'settled-loss').length

  return (
    <div className={cn('flex flex-col gap-3', className)}>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-bold" style={{ color: 'var(--probex-text-primary)' }}>
          Settled Positions
        </h2>

        <div className="flex items-center gap-3">
          {/* Win/loss summary */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--probex-positive-dim)', color: 'var(--probex-positive)' }}>
              {wins}W
            </span>
            <span className="font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--probex-negative-dim)', color: 'var(--probex-negative)' }}>
              {losses}L
            </span>
          </div>

          {/* Consensus accuracy badge */}
          {accuracy !== null && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5"
              style={{ background: 'var(--probex-primary-dim)', color: 'var(--probex-primary)', border: '1px solid var(--probex-yes-border)' }}
            >
              <span className="live-dot w-1.5 h-1.5" aria-hidden="true" />
              Consensus accuracy {Math.round(accuracy * 100)}%
            </span>
          )}
        </div>
      </div>

      <PositionFilters
        pnlState={pnlState}
        onPnlChange={setPnlState}
        alignmentState={alignmentState}
        onAlignmentChange={setAlignmentState}
      />

      <PositionTable positions={filtered} isSettled />

    </div>
  )
}
