'use client'

/**
 * PositionsView —.2
 * ───────────────────────────
 * Dedicated /dashboard/positions page. Reuses the existing
 * OpenPositions and SettledPositions components with a
 * tab switcher driven by portfolioStore.positionsTab.
 */

import { PageHeader }        from '@/components/ui/PageHeader'
import { OpenPositions }     from './OpenPositions'
import { SettledPositions }  from './SettledPositions'
import { usePortfolioStore } from '@/store/portfolioStore'

const TABS: Array<{ id: 'open' | 'settled'; label: string }> = [
  { id: 'open',    label: 'Open Positions' },
  { id: 'settled', label: 'Settled' },
]

export function PositionsView() {
  const positionsTab    = usePortfolioStore((s) => s.positionsTab)
  const setPositionsTab = usePortfolioStore((s) => s.setPositionsTab)

  // Normalise 'all' → 'open' for this two-tab view
  const activeTab = positionsTab === 'settled' ? 'settled' : 'open'

  return (
    <div className="page-container">
      <PageHeader
        title="Positions"
        subtitle="Track your open and settled prediction market positions"
      />

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--probex-border)' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setPositionsTab(tab.id)}
              style={{
                padding:        '9px 16px',
                fontSize:       13,
                fontWeight:     isActive ? 600 : 500,
                color:          isActive ? 'var(--probex-primary)' : 'var(--probex-text-muted)',
                background:     'transparent',
                border:         'none',
                borderBottom:   isActive ? '2px solid var(--probex-primary)' : '2px solid transparent',
                marginBottom:   -1,
                cursor:         'pointer',
                transition:     'color 0.15s',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'open' ? <OpenPositions /> : <SettledPositions />}
    </div>
  )
}
