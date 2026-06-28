/**
 * Consensus Transformers
 * ──────────────────────
 * implementation.
 *
 * Transformers enrich ConsensusState objects after adapter translation.
 * They add derived fields, apply business rules, and normalize edge cases.
 *
 * Separation from adapters:
 *   Adapters   → translate format (API schema → app schema)
 *   Transformers → add meaning (app schema → enriched app schema)
 *
 * Planned transformers:
 *
 *   enrichConsensusState(state: ConsensusState): EnrichedConsensusState
 *   ───────────────────────────────────────────────────────────────────
 *   Adds derived fields:
 *     - consensusColor: CSS variable based on score
 *     - biasAlignment: whether institutional and retail agree
 *     - signalQuality: composite signal quality rating
 *     - ageSeconds: seconds since last update
 *     - isStale: true if > 30s since last update
 *
 *   normalizeConsensusHistory(history: ConsensusHistoryPoint[]): NormalizedHistory
 *   ────────────────────────────────────────────────────────────────────────────
 *   Normalizes time-series data for Recharts:
 *     - Fills gaps with interpolated values
 *     - Ensures consistent time intervals
 *     - Converts timestamps to chart-ready format
 *
 *   diffConsensusUpdate(prev: ConsensusState, update: ConsensusUpdate): ConsensusDiff
 *   ─────────────────────────────────────────────────────────────────────────────────
 *   Computes what changed between states — used for UI flash animations:
 *     - scoreDelta: change in score
 *     - biasChanged: whether bias flipped
 *     - signalChanged: whether signal strength changed
 */

export {} // Module marker — no exports until implemented
