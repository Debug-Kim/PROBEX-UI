// Pure consensus-alignment logic for positions: classifies whether a position's
// side (YES/NO) agrees with the Probex Consensus Engine's institutional bias for
// its market. The consensus map is passed in (sourced from the service registry
// via useConsensusMap), so this stays free of any mock-data dependency.

import type { Position } from '@/types/wallet'
import type { ConsensusState } from '@/types/consensus'

export type AlignmentType = 'aligned' | 'divergent' | 'neutral' | 'unknown'

export interface PositionConsensus {
  consensus:  ConsensusState | undefined
  alignment:  AlignmentType
}

/** Consensus state + alignment classification for a position, given the map. */
export function getPositionAlignment(
  position: Position,
  consensusMap: Record<string, ConsensusState>,
): PositionConsensus {
  const consensus = consensusMap[position.marketId as string]
  if (!consensus) return { consensus: undefined, alignment: 'unknown' }

  const isYes    = position.side === 'yes'
  const bullish  = consensus.institutionalBias === 'bullish' && consensus.score > 0.6
  const bearish  = consensus.institutionalBias === 'bearish' || consensus.score < 0.4

  let alignment: AlignmentType
  if      (isYes  && bullish) alignment = 'aligned'
  else if (!isYes && bearish) alignment = 'aligned'
  else if (isYes  && bearish) alignment = 'divergent'
  else if (!isYes && bullish) alignment = 'divergent'
  else alignment = 'neutral'

  return { consensus, alignment }
}

// ─── Display helpers ────────────────────────────────────────────────────

export const ALIGNMENT_LABELS: Record<AlignmentType, string> = {
  aligned:   '⚡ Aligned',
  divergent: '⚠ Contrarian',
  neutral:   '→ Neutral',
  unknown:   '— N/A',
}

export const ALIGNMENT_COLORS: Record<AlignmentType, string> = {
  aligned:   'var(--probex-positive)',
  divergent: 'var(--probex-warning)',
  neutral:   'var(--probex-text-muted)',
  unknown:   'var(--probex-text-disabled)',
}
