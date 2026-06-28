'use client'

import { cn }                  from '@/lib/utils'
import { useIsWalletConnected } from '@/store/walletStore'
import { WalletOverview }       from './WalletOverview'
import { WalletBalanceCard }    from './WalletBalanceCard'
import { ConnectedWallets }     from './ConnectedWallets'
import { ConnectWalletModal }   from './ConnectWalletModal'
import { FundingMethods }       from './FundingMethods'
import { FundingHub }           from './FundingHub'
import { TransactionHistory }   from './TransactionHistory'
import { WalletInsights }       from './WalletInsights'
import { PortfolioCrossLink }   from './PortfolioCrossLink'

interface WalletPageProps {
  className?: string
}

/**
 * WalletPage
 * ──────────
 * Master assembly of the complete Wallet & Funding experience.
 *
 * Section order (top → bottom):
 *   1. WalletOverview      — 5-stat headline row
 *   2. Balance + Connected — WalletBalanceCard (left) + ConnectedWallets (right)
 *   3. PortfolioCrossLink   — subtle Portfolio integration row
 *   4. FundingMethods       — available deposit/withdrawal methods
 *   5. FundingHub           — tabbed Deposit/Withdraw/Transfer
 *   6. TransactionHistory   — full searchable/sortable/filterable table
 *   7. WalletInsights       — institutional funding summary
 *
 * If the wallet is disconnected, ConnectedWallets shows a connect
 * prompt and ConnectWalletModal renders globally (controlled by
 * walletStore.isConnectModalOpen).
 */
export function WalletPage({ className }: WalletPageProps) {
  const isConnected = useIsWalletConnected()

  return (
    <div className={cn('page-container flex flex-col gap-5 pb-8', className)}>

      {/* ── Page title ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--probex-text-primary)' }}>
            Wallet
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--probex-text-muted)' }}>
            Balances, funding, and transaction history on Polygon
          </p>
        </div>
      </div>

      {/* ── 1. Overview ────────────────────────────────────────────── */}
      <WalletOverview />

      {/* ── 2. Balance + Connected Wallet ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3">
        <WalletBalanceCard />
        <ConnectedWallets />
      </div>

      {/* ── 3. Portfolio cross-link ────────────────────────────────── */}
      <PortfolioCrossLink />

      {isConnected ? (
        <>
          {/* ── 4. Funding Methods ──────────────────────────────────── */}
          <FundingMethods />

          {/* ── 5. Funding Hub ──────────────────────────────────────── */}
          <FundingHub />

          {/* ── 6. Transaction History ──────────────────────────────── */}
          <TransactionHistory />

          {/* ── 7. Wallet Insights ───────────────────────────────────── */}
          <WalletInsights />
        </>
      ) : (
        <div
          className="rounded-xl p-8 flex flex-col items-center gap-2 text-center"
          style={{ background: 'var(--probex-surface)', border: '1px dashed var(--probex-border-default)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--probex-text-secondary)' }}>
            Connect a wallet to access funding and transaction history
          </p>
          <p className="text-xs" style={{ color: 'var(--probex-text-muted)' }}>
            Use the &ldquo;Connect Wallet&rdquo; button above to get started.
          </p>
        </div>
      )}

      {/* ── Global modal ────────────────────────────────────────────── */}
      <ConnectWalletModal />

    </div>
  )
}
