'use client'

/**
 * GlobalConsensusBar
 *
 * Subscribes to useGlobalStream() to show the live global consensus score.
 * Falls back to MOCK_GLOBAL_CONSENSUS when flag is off.
 *
 * Layout unchanged from.
 */

import { useGlobalStream } from '@/hooks/useGlobalStream'
import { MOCK_GLOBAL_CONSENSUS } from '@/mock/consensus'
import { LiveIndicator } from '@/components/live/LiveIndicator'

export function GlobalConsensusBar() {
  const { consensusScore, participation, bullishCount, bearishCount, isLive } =
    useGlobalStream()

  const totalCount = bullishCount + bearishCount
  const bullishPct =
    totalCount > 0 ? Math.round((bullishCount / totalCount) * 100) : 50

  // Use live data when available, static when not
  const displayScore = isLive ? consensusScore : MOCK_GLOBAL_CONSENSUS.score

  return (
    <div
      role="banner"
      aria-label="Global consensus indicator"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '8px 24px',
        backgroundColor: 'var(--probex-surface)',
        borderBottom: '1px solid var(--probex-border)',
        fontSize: 12,
        flexWrap: 'wrap',
      }}
    >
      {/* Consensus score — dominant */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'var(--probex-text-muted)',
          }}
        >
          Global Consensus
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--probex-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {(displayScore * 100).toFixed(0)}
        </span>
 {isLive && <LiveIndicator variant="dot" />}
      </div>

      {/* Participation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: 11,
            color: 'var(--probex-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Participation
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--probex-text-secondary)',
          }}
        >
          {(participation * 100).toFixed(0)}%
        </span>
      </div>

      {/* Bullish / Bearish split */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--probex-yes)',
          }}
        >
          {bullishPct}% Bullish
        </span>
        <span style={{ color: 'var(--probex-border)', fontSize: 10 }}>·</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--probex-no)',
          }}
        >
          {100 - bullishPct}% Bearish
        </span>
      </div>
    </div>
  )
}
