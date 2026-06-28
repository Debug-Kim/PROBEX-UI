'use client'

import { useState }          from 'react'
import { cn }                from '@/lib/utils'
import { useMarketStore }    from '@/store/marketStore'
import type { Market }       from '@/types/market'
import type { ConsensusState } from '@/types/consensus'
import { OutcomeSelector }   from './OutcomeSelector'
import { StakeInput }        from './StakeInput'
import { TradeSummary }      from './TradeSummary'
import { PositionPreview }   from './PositionPreview'
import { ConsensusBadge }    from '@/components/markets/ConsensusBadge'

interface TradingDrawerProps {
  market:           Market
  consensus?:       ConsensusState
  className?:       string
 liveProbability?: number | undefined // live probability for trade summary
}

type DrawerTab = 'trade' | 'info'

/**
 * TradingDrawer
 * ─────────────
 * The sticky right-column trading panel on the market detail page.
 * Assembles all trading sub-components into a cohesive experience.
 *
 * Layout:
 *   Header      — market title, consensus badge, close
 *   Tabs        — Trade / Market Info
 *   ─────────────────────────────────────
 *   Trade tab:
 *     OutcomeSelector (YES / NO)
 *     StakeInput       ($ amount + quick-fill)
 *     TradeSummary     (computed payout, return, consensus alignment)
 *     PositionPreview  (what the position looks like — shown when valid stake)
 * Submit button (disabled — )
 *   ─────────────────────────────────────
 *   Info tab:
 *     Key market stats
 *
 * wire submit button to tradingService.placeOrder.
 * connect wallet balance, show available funds.
 */
export function TradingDrawer({ market, consensus, className , liveProbability: _liveProbability }: TradingDrawerProps) {
  const [activeTab, setActiveTab]   = useState<DrawerTab>('trade')
  const [submitted, setSubmitted]   = useState(false)
  const { stakeInput, activeOutcome } = useMarketStore()
  const stake = parseFloat(stakeInput) || 0

  const handleMockSubmit = async () => {
    if (stake <= 0) return
    // Simulate async submission
    setSubmitted(true)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitted(false)
  }

  return (
    <div
      className={cn('flex flex-col rounded-xl overflow-hidden', className)}
      style={{
        background: 'var(--probex-surface)',
        border:     '1px solid var(--probex-border-default)',
      }}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <div
        className="flex items-start gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid var(--probex-border)' }}
      >
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-semibold leading-snug line-clamp-2"
            style={{ color: 'var(--probex-text-primary)' }}
          >
            {market.title}
          </p>
          {consensus && (
            <div className="flex items-center gap-1.5 mt-1">
              <ConsensusBadge score={consensus.score} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid var(--probex-border)' }}
        role="tablist"
      >
        {(['trade', 'info'] as DrawerTab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2.5 text-xs font-semibold capitalize cursor-pointer transition-colors duration-100"
            style={{
              color:       activeTab === tab ? 'var(--probex-primary)' : 'var(--probex-text-muted)',
              borderBottom: activeTab === tab ? `2px solid var(--probex-primary)` : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab === 'trade' ? 'Trade' : 'Market Info'}
          </button>
        ))}
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* ── TRADE TAB ─────────────────────────────────────────── */}
        {activeTab === 'trade' && (
          <>
            {/* Probability recap */}
            <ProbabilityRecap market={market} />

            {/* Outcome selector */}
            <OutcomeSelector
              yesPrice={market.yesPrice}
              noPrice={market.noPrice}
            />

            {/* Stake input */}
            <StakeInput />

            {/* Trade summary */}
            {stake > 0 && (
              <TradeSummary
                yesPrice={market.yesPrice}
                noPrice={market.noPrice}
                consensus={consensus}
              />
            )}

            {/* Position preview */}
            <PositionPreview
              marketTitle={market.title}
              yesPrice={market.yesPrice}
              noPrice={market.noPrice}
              closesAt={market.closesAt}
              consensus={consensus}
            />

            {/* Submit button */}
            <SubmitButton
              outcome={activeOutcome}
              stake={stake}
              isSubmitting={submitted}
              onClick={handleMockSubmit}
            />

            {/* Disclaimer */}
            <p className="text-2xs text-center leading-relaxed" style={{ color: 'var(--probex-text-disabled)' }}>
              Trading demo only. No real orders are placed.
              Order routing is simulated in this build.
            </p>
          </>
        )}

        {/* ── INFO TAB ──────────────────────────────────────────── */}
        {activeTab === 'info' && (
          <MarketInfoTab market={market} consensus={consensus} />
        )}

      </div>
    </div>
  )
}

// ─── Probability Recap ────────────────────────────────────────────────────

function ProbabilityRecap({ market }: { market: Market }) {
  const yesPct = Math.round(market.probability * 100)
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
      style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border)' }}
    >
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>Current probability</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tabular-nums" style={{ color: 'var(--probex-yes)' }}>{yesPct}%</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--probex-border-default)' }}>
            <div className="h-full rounded-full" style={{ width: `${yesPct}%`, background: 'var(--probex-yes)' }} />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>NO</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--probex-no)' }}>{100 - yesPct}%</span>
      </div>
    </div>
  )
}

// ─── Submit Button ────────────────────────────────────────────────────────

function SubmitButton({
  outcome, stake, isSubmitting, onClick,
}: {
  outcome:      'yes' | 'no'
  stake:        number
  isSubmitting: boolean
  onClick:      () => void
}) {
  const isYes    = outcome === 'yes'
  const disabled = stake <= 0

  return (
    <button
      onClick={onClick}
      disabled={disabled || isSubmitting}
      type="button"
      className={cn(
        'w-full h-11 rounded-lg text-sm font-bold',
        'flex items-center justify-center gap-2',
        'transition-all duration-150 cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
      )}
      style={{
        background: disabled ? 'var(--probex-surface-3)'
          : isYes ? 'var(--probex-gradient-yes)' : 'var(--probex-gradient-no)',
        color: disabled ? 'var(--probex-text-disabled)' : isYes ? '#050816' : '#fff',
      }}
    >
      {isSubmitting && (
        <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      )}
      {isSubmitting ? 'Placing order…'
        : disabled ? `Enter amount to trade ${outcome.toUpperCase()}`
        : `Buy ${outcome.toUpperCase()} — $${stake.toFixed(2)}`}
    </button>
  )
}

// ─── Market Info Tab ──────────────────────────────────────────────────────

function MarketInfoTab({ market, consensus }: { market: Market; consensus?: ConsensusState | undefined }) {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Segment',      value: market.segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) },
    { label: 'Status',       value: market.status.charAt(0).toUpperCase() + market.status.slice(1) },
    { label: 'Open Interest',value: `$${(market.openInterest / 1_000).toFixed(0)}K` },
    { label: 'Liquidity',    value: `$${(market.liquidity / 1_000_000).toFixed(1)}M` },
    { label: 'Volume 24h',   value: `$${(market.volume24h / 1_000).toFixed(0)}K` },
    { label: 'Total Volume', value: `$${(market.volumeTotal / 1_000_000).toFixed(2)}M` },
    { label: 'Closes',       value: new Date(market.closesAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
  ]

  if (consensus) {
    rows.push({ label: 'Consensus',  value: `${Math.round(consensus.score * 100)}%` })
    rows.push({ label: 'Signal',     value: consensus.signalStrength.charAt(0).toUpperCase() + consensus.signalStrength.slice(1) })
    rows.push({ label: 'Confidence', value: consensus.confidence.charAt(0).toUpperCase() + consensus.confidence.slice(1) })
  }

  return (
    <div className="flex flex-col gap-0 rounded-lg overflow-hidden" style={{ border: '1px solid var(--probex-border)' }}>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className="flex items-center justify-between px-3 py-2.5"
          style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--probex-border)' : 'none' }}
        >
          <span className="text-xs" style={{ color: 'var(--probex-text-muted)' }}>{row.label}</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--probex-text-primary)' }}>{row.value}</span>
        </div>
      ))}
    </div>
  )
}
