'use client'

import { cn } from '@/lib/utils'
import { formatAddress, explorerAddressUrl } from '@/lib/web3/utils/formatAddress'
import { getActiveChainConfig } from '@/lib/web3/utils/chainConfig'
import { MOCK_CONNECTED_WALLET, NETWORK_LABELS, PROVIDER_LABELS, PROVIDER_ICONS } from '@/mock/connectedWallets'
import { useIsWalletConnected, useWalletStore } from '@/store/walletStore'
import { formatRelativeTime } from '@/lib/utils'

interface ConnectedWalletsProps {
  className?: string
}

/**
 * ConnectedWallets
 * ─────────────────
 * Shows the currently connected wallet (mock) with provider, network,
 * truncated address (with copy + explorer link), and last activity.
 *
 * If disconnected, shows a "Connect Wallet" prompt that opens
 * ConnectWalletModal.
 */
export function ConnectedWallets({ className }: ConnectedWalletsProps) {
  const isConnected     = useIsWalletConnected()
  const openConnectModal = useWalletStore((s) => s.openConnectModal)
  const toggleConnection = useWalletStore((s) => s.toggleConnection)

  const wallet  = MOCK_CONNECTED_WALLET
  const chain   = getActiveChainConfig()

  if (!isConnected) {
    return (
      <div
        className={cn('rounded-xl p-5 flex flex-col items-center gap-3 text-center', className)}
        style={{ background: 'var(--probex-surface)', border: '1px dashed var(--probex-border-default)' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)' }}
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--probex-text-muted)' }}>
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--probex-text-secondary)' }}>No wallet connected</p>
          <p className="text-xs mt-1" style={{ color: 'var(--probex-text-muted)' }}>
            Connect a Polygon wallet to deposit, withdraw, and trade.
          </p>
        </div>
        <button onClick={openConnectModal} className="btn-primary px-5 py-2 text-sm">
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn('rounded-xl overflow-hidden', className)}
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-primary)' }}>
          Connected Wallet
        </h2>
        <span className="flex items-center gap-1.5 text-2xs" style={{ color: 'var(--probex-positive)' }}>
          <span className="live-dot w-1.5 h-1.5" aria-hidden="true" />
          Connected
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Provider + address */}
        <div className="flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)' }}
            aria-hidden="true"
          >
            {PROVIDER_ICONS[wallet.provider]}
          </span>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold" style={{ color: 'var(--probex-text-primary)' }}>
              {PROVIDER_LABELS[wallet.provider]}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono" style={{ color: 'var(--probex-text-muted)' }}>
                {formatAddress(wallet.address)}
              </span>
              <CopyButton value={wallet.address} />
              <a
                href={explorerAddressUrl(wallet.address, chain.blockExplorerUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
                style={{ color: 'var(--probex-text-muted)' }}
                aria-label="View on block explorer"
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--probex-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--probex-text-muted)' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Network + activity grid */}
        <div className="grid grid-cols-2 gap-2">
          <InfoCell label="Network" value={NETWORK_LABELS[wallet.networkId]} valueColor="var(--probex-positive)" />
          <InfoCell label="Last Activity" value={formatRelativeTime(wallet.lastActiveAt)} />
          <InfoCell label="Connected Since" value={formatRelativeTime(wallet.connectedAt)} />
          <InfoCell label="Chain ID" value={String(chain.chainId)} />
        </div>

        {/* Disconnect */}
        <button
          onClick={toggleConnection}
          className="text-xs font-medium px-3 py-2 rounded-md cursor-pointer transition-colors duration-100 self-start"
          style={{ background: 'var(--probex-negative-dim)', color: 'var(--probex-negative)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          Disconnect Wallet
        </button>
      </div>
    </div>
  )
}

// ─── Info Cell ────────────────────────────────────────────────────────────

function InfoCell({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-2.5 rounded-lg" style={{ background: 'var(--probex-surface-2)' }}>
      <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>{label}</span>
      <span className="text-xs font-semibold" style={{ color: valueColor ?? 'var(--probex-text-primary)' }}>{value}</span>
    </div>
  )
}

// ─── Copy Button ──────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value).catch(() => {})
  }
  return (
    <button
      onClick={handleCopy}
      className="cursor-pointer"
      style={{ color: 'var(--probex-text-muted)' }}
      aria-label="Copy wallet address"
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--probex-primary)' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--probex-text-muted)' }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  )
}
