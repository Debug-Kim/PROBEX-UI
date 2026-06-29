'use client'

// Thesis + key metrics for the market detail terminal.
// Sits in the center column beneath the charts.

import { formatCompact, probabilityColorVar } from '@/lib/utils'
import type { Market }         from '@/types/market'
import type { ConsensusState } from '@/types/consensus'

interface MarketThesisPanelProps {
  market:    Market
  consensus: ConsensusState
  liveProbability?: number | undefined
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 3,
      padding: '10px 12px',
      background: 'var(--probex-surface-2)',
      border: '1px solid var(--probex-border)',
      borderRadius: 8,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--probex-text-muted)' }}>
        {label}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color: accent ?? 'var(--probex-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  )
}

export function MarketThesisPanel({ market, consensus, liveProbability }: MarketThesisPanelProps) {
  const prob     = liveProbability ?? market.probability
  const probColor = probabilityColorVar(prob)
  const resolves = new Date(market.closesAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
  const daysLeft = Math.max(0, Math.ceil((new Date(market.closesAt).getTime() - Date.now()) / 86_400_000))

  return (
    <div style={{ padding: '16px 20px', borderTop: '1px solid var(--probex-border)', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Key metrics grid */}
      <div>
        <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--probex-text-primary)', marginBottom: 10 }}>
          Key Metrics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
          <Metric label="YES Price"   value={`${Math.round(prob * 100)}¢`} accent={probColor} />
          <Metric label="Consensus"   value={`${Math.round(consensus.score * 100)}/100`} />
          <Metric label="24h Volume"  value={`$${formatCompact(market.volume24h)}`} />
          <Metric label="Open Int."   value={`$${formatCompact(market.openInterest)}`} />
          <Metric label="Liquidity"   value={`$${formatCompact(market.liquidity)}`} />
          <Metric label="Resolves In" value={`${daysLeft}d`} />
        </div>
      </div>

      {/* Thesis */}
      {market.description && (
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--probex-text-primary)', marginBottom: 8 }}>
            Market Thesis
          </h3>
          <p style={{ fontSize: 13, color: 'var(--probex-text-secondary)', lineHeight: 1.65, margin: 0 }}>
            {market.description}
          </p>
        </div>
      )}

      {/* Resolution criteria */}
      <div>
        <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--probex-text-primary)', marginBottom: 8 }}>
          Resolution
        </h3>
        <p style={{ fontSize: 12, color: 'var(--probex-text-muted)', lineHeight: 1.6, margin: 0 }}>
          {market.resolutionCriteria}
        </p>
        <p style={{ fontSize: 11, color: 'var(--probex-text-muted)', marginTop: 6 }}>
          Closes <strong style={{ color: 'var(--probex-text-secondary)' }}>{resolves}</strong>
        </p>
      </div>
    </div>
  )
}
