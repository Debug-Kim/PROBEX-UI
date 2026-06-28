/**
 * Consensus Adapters
 * ───────────────────
 * implementation (when Consensus Engine API is available).
 *
 * The adapter layer is responsible for transforming raw API responses
 * from the Probex Consensus Engine into typed ConsensusState objects.
 *
 * This translation layer ensures:
 *   1. API schema changes only require adapter updates — not UI component changes.
 *   2. String literals from the API ('bull', 'bear') are validated and
 *      converted to typed enums ('bullish', 'bearish').
 *   3. Percentage values (0–100) are normalized to 0–1 floats.
 *   4. Missing or malformed API fields get safe defaults.
 *
 * Planned adapters:
 *
 *   RestConsensusAdapter
 *   ─────────────────────
 *   Transforms responses from the REST endpoint:
 *     GET /v1/consensus/{marketId}
 *     GET /v1/consensus/batch
 *     GET /v1/consensus/global
 *
 *   WebSocketConsensusAdapter
 *   ──────────────────────────
 *   Processes real-time update events from the WebSocket channel:
 *     ws://consensus.probex.io/v1/stream
 *     Message type: { type: "consensus_update", market_id, data }
 *
 *   MockConsensusAdapter
 *   ─────────────────────
 * Generates deterministic mock consensus data for –3.
 *   Used when NEXT_PUBLIC_API_MODE=mock.
 *   Implements the same IConsensusAdapter interface for seamless swap.
 */

export {} // Module marker — no exports until implemented
