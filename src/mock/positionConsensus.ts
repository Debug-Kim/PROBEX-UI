/**
 * Position Consensus Alignment
 * ──────────────────────────────
 * Computes whether a position's side (YES/NO) aligns with the
 * Probex Consensus Engine's institutional bias for that market.
 *
 * This is the bridge between mock/positions.ts and mock/consensus.ts.
 * replace with IConsensusService cross-reference at the API layer.
 */

import type { Position } from '@/types/wallet'
import type { ConsensusState } from '@/types/consensus'
import { MOCK_CONSENSUS_MAP } from './consensus'

export type AlignmentType = 'aligned' | 'divergent' | 'neutral' | 'unknown'

export interface PositionConsensus {
  consensus:  ConsensusState | undefined
  alignment:  AlignmentType
}

/**
 * Returns the consensus state and alignment classification for a position.
 *
 * Alignment logic mirrors components/trading/TradeSummary.tsx:
 *   - 'aligned'   — position side agrees with institutional bias
 *   - 'divergent' — position side contradicts institutional bias
 *   - 'neutral'   — institutional bias is neutral / ambiguous
 *   - 'unknown'   — no consensus data available for this market
 */
export function getPositionConsensus(position: Position): PositionConsensus {
  const consensus = MOCK_CONSENSUS_MAP[position.marketId as string]
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
