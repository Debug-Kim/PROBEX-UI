'use client'

import { useState }              from 'react'
import { cn }                    from '@/lib/utils'
import { useMarketResearch }     from '@/hooks/useServices'
import type { KeyDriver }        from '@/types/marketDetail'
import type { ReactNode } from 'react'

interface MarketResearchPanelProps {
  marketId:  string
  className?: string
}

export function MarketResearchPanel({ marketId, className }: MarketResearchPanelProps) {
  const [expandedDriver, setExpandedDriver] = useState<number | null>(null)
  const research = useMarketResearch(marketId).data

  if (!research) return null

  return (
    <div
      className={cn('rounded-xl overflow-hidden', className)}
      style={{
        background: 'var(--probex-surface)',
        border:     '1px solid var(--probex-border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid var(--probex-border)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--probex-primary)' }} aria-hidden="true">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-primary)' }}>
          Market Intelligence
        </h2>
        <span className="ml-auto text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
          by @{research.analystHandle}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-5">

        {/* Summary */}
        <section>
          <SectionLabel>Overview</SectionLabel>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--probex-text-secondary)' }}>
            {research.summary}
          </p>
        </section>

        {/* Key Drivers */}
        <section>
          <SectionLabel>Key Drivers</SectionLabel>
          <div className="flex flex-col gap-2">
            {research.keyDrivers.map((driver, idx) => (
              <DriverCard
                key={idx}
                driver={driver}
                isExpanded={expandedDriver === idx}
                onToggle={() => setExpandedDriver(expandedDriver === idx ? null : idx)}
              />
            ))}
          </div>
        </section>

        {/* Supporting Signals */}
        <section>
          <SectionLabel>Supporting Signals</SectionLabel>
          <ul className="flex flex-col gap-1.5">
            {research.supportingSignals.map((signal, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: 'var(--probex-primary-dim)' }}
                  aria-hidden="true"
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ color: 'var(--probex-primary)' }}>
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </span>
                <span className="text-sm" style={{ color: 'var(--probex-text-secondary)' }}>
                  {signal}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Risks */}
        <section>
          <SectionLabel>Risks</SectionLabel>
          <ul className="flex flex-col gap-1.5">
            {research.risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: 'var(--probex-negative-dim)' }}
                  aria-hidden="true"
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ color: 'var(--probex-negative)' }}>
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </span>
                <span className="text-sm" style={{ color: 'var(--probex-text-secondary)' }}>
                  {risk}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Analyst Notes */}
        <section>
          <SectionLabel>Analyst Notes</SectionLabel>
          <div
            className="p-3 rounded-lg text-sm leading-relaxed"
            style={{
              background: 'var(--probex-surface-2)',
              border:     '1px solid var(--probex-border)',
              color:      'var(--probex-text-secondary)',
              fontStyle:  'italic',
            }}
          >
            &ldquo;{research.analystNotes}&rdquo;
          </div>
        </section>

        {/* Last updated */}
        <p className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
          Last updated {new Date(research.lastUpdated).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
          })}
        </p>

      </div>
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3
      className="text-2xs font-semibold uppercase tracking-wider mb-2"
      style={{ color: 'var(--probex-text-muted)' }}
    >
      {children}
    </h3>
  )
}

// ─── Driver Card ──────────────────────────────────────────────────────────

function DriverCard({
  driver, isExpanded, onToggle,
}: {
  driver:     KeyDriver
  isExpanded: boolean
  onToggle:   () => void
}) {
  const colorVar = driver.direction === 'bullish'
    ? 'var(--probex-positive)'
    : driver.direction === 'bearish'
      ? 'var(--probex-negative)'
      : 'var(--probex-warning)'

  const weightDot = driver.weight === 'high' ? 3 : driver.weight === 'medium' ? 2 : 1

  return (
    <div
      className="rounded-lg overflow-hidden cursor-pointer transition-colors duration-100"
      style={{ border: '1px solid var(--probex-border)' }}
      onClick={onToggle}
    >
      <div
        className="flex items-center gap-3 px-3 py-2.5"
        style={{ background: 'var(--probex-surface-2)' }}
      >
        {/* Direction indicator */}
        <span
          className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold"
          style={{
            background: `color-mix(in srgb, ${colorVar} 14%, transparent)`,
            color:      colorVar,
          }}
          aria-hidden="true"
        >
          {driver.direction === 'bullish' ? '↑' : driver.direction === 'bearish' ? '↓' : '→'}
        </span>

        {/* Label + weight */}
        <span className="flex-1 text-sm font-medium" style={{ color: 'var(--probex-text-primary)' }}>
          {driver.label}
        </span>

        {/* Weight dots */}
        <div className="flex items-center gap-0.5" title={`Weight: ${driver.weight}`} aria-label={`${driver.weight} weight`}>
          {[1, 2, 3].map((d) => (
            <span
              key={d}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: d <= weightDot ? colorVar : 'var(--probex-border-default)' }}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Chevron */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            color:     'var(--probex-text-muted)',
            transform: isExpanded ? 'rotate(180deg)' : '',
            transition: 'transform 0.15s',
          }}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>

      {/* Expanded description */}
      {isExpanded && (
        <div
          className="px-3 py-2.5 text-sm leading-relaxed"
          style={{
            color:      'var(--probex-text-secondary)',
            borderTop:  '1px solid var(--probex-border)',
          }}
        >
          {driver.description}
        </div>
      )}
    </div>
  )
}
