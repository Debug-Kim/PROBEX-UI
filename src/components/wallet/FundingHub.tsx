'use client'

import { cn }              from '@/lib/utils'
import { useWalletStore }  from '@/store/walletStore'
import type { FundingFlow } from '@/store/walletStore'
import { DepositPanel }    from './DepositPanel'
import { WithdrawalPanel } from './WithdrawalPanel'
import { TransferPanel }   from './TransferPanel'

const TABS: Array<{ id: Exclude<FundingFlow, null>; label: string }> = [
  { id: 'deposit',  label: 'Deposit'  },
  { id: 'withdraw', label: 'Withdraw' },
  { id: 'transfer', label: 'Transfer' },
]

/**
 * FundingHub
 * ──────────
 * The primary action section on the Wallet page.
 * Tab-switches between DepositPanel, WithdrawalPanel, and TransferPanel.
 *
 * Tab selection drives `walletStore.activeFundingFlow`. If a user clicked
 * a FundingMethod card elsewhere (setting activeFundingFlow='deposit'
 * and a selectedFundingMethod), this hub opens already on the Deposit tab.
 */
export function FundingHub({ className }: { className?: string }) {
  const activeFlow    = useWalletStore((s) => s.activeFundingFlow)
  const setFundingFlow = useWalletStore((s) => s.setFundingFlow)

  // Default to 'deposit' tab if nothing selected yet
  const activeTab: Exclude<FundingFlow, null> = activeFlow ?? 'deposit'

  return (
    <div className={cn('rounded-xl overflow-hidden', className)} style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border-default)' }}>

      {/* Header + Tabs */}
      <div className="px-4 pt-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--probex-text-primary)' }}>
          Move Funds
        </h2>
        <div className="flex" role="tablist" aria-label="Funding actions">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setFundingFlow(tab.id)}
              className="text-xs font-semibold px-4 py-2 cursor-pointer transition-colors duration-100"
              style={{
                color:        activeTab === tab.id ? 'var(--probex-primary)' : 'var(--probex-text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--probex-primary)' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel content — hideHeader=true suppresses each panel's internal title/close chrome.
          style override strips the panel's outer border/bg so it merges with FundingHub's chrome. */}
      <div>
        {activeTab === 'deposit'  && <DepositPanel    hideHeader style={{ border: 'none', borderRadius: 0 }} />}
        {activeTab === 'withdraw' && <WithdrawalPanel hideHeader style={{ border: 'none', borderRadius: 0 }} />}
        {activeTab === 'transfer' && <TransferPanel   hideHeader style={{ border: 'none', borderRadius: 0 }} />}
      </div>

    </div>
  )
}
