// Mock convenience wrapper around the pure alignment logic in
// @/lib/positions/alignment, binding the mock consensus map. The canonical logic,
// types, and display constants live in the lib module; this re-exports them so
// non-migrated consumers keep working. Migrated components use the lib module +
// useConsensusMap() instead.

import type { Position } from '@/types/wallet'
import { MOCK_CONSENSUS_MAP } from './consensus'
import { getPositionAlignment, type PositionConsensus } from '@/lib/positions/alignment'

export type { AlignmentType, PositionConsensus } from '@/lib/positions/alignment'
export { ALIGNMENT_LABELS, ALIGNMENT_COLORS } from '@/lib/positions/alignment'

export function getPositionConsensus(position: Position): PositionConsensus {
  return getPositionAlignment(position, MOCK_CONSENSUS_MAP)
}
