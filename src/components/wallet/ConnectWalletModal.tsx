'use client'

import { useState, useEffect } from 'react'
import { cn }       from '@/lib/utils'
import type { WalletProvider } from '@/types/wallet'

interface WalletProviderMeta {
  id:          WalletProvider
  name:        string
  description: string
  iconLabel:   string
  isInstalled: boolean
}

const MOCK_WALLET_PROVIDERS: WalletProviderMeta[] = [
  {
    id:          'metamask',
    name:        'MetaMask',
    description: 'Connect using the MetaMask browser extension or mobile app.',
    iconLabel:   '🦊',
    isInstalled: true,
  },
  {
    id:          'walletconnect',
    name:        'WalletConnect',
    description: 'Scan a QR code to connect with any WalletConnect-compatible wallet.',
    iconLabel:   '🔗',
    isInstalled: false,
  },
  {
    id:          'coinbase',
    name:        'Coinbase Wallet',
    description: 'Connect using the Coinbase Wallet browser extension or mobile app.',
    iconLabel:   '🔵',
    isInstalled: false,
  },
]
import { useIsConnectModalOpen, useWalletStore } from '@/store/walletStore'

/**
 * ConnectWalletModal
 * ───────────────────
 * Mock wallet connector selection modal.
 * Lists MetaMask, WalletConnect, Coinbase Wallet with installed/available state.
 *
 * Clicking a provider simulates a brief "connecting" delay then sets
 * walletStore.isConnected = true. No real wallet SDKs are invoked.
 *
 * replace handleConnect with real wagmi connector.connect calls.
 */
export function ConnectWalletModal() {
  const isOpen           = useIsConnectModalOpen()
  const closeConnectModal = useWalletStore((s) => s.closeConnectModal)
  const toggleConnection  = useWalletStore((s) => s.toggleConnection)
  const setSelectedProvider = useWalletStore((s) => s.setSelectedProvider)

  const [connecting, setConnecting] = useState<WalletProvider | null>(null)

  // Close on Escape key — keyboard accessibility
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connecting === null) closeConnectModal()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, connecting, closeConnectModal])

  if (!isOpen) return null

  const handleConnect = async (provider: WalletProvider) => {
    setConnecting(provider)
    setSelectedProvider(provider)
    await new Promise((r) => setTimeout(r, 1100))
    setConnecting(null)
    toggleConnection()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-wallet-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={closeConnectModal}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-xl overflow-hidden animate-fade-in-up"
        style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border-default)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--probex-border)' }}>
          <h2 id="connect-wallet-title" className="text-sm font-bold" style={{ color: 'var(--probex-text-primary)' }}>
            Connect Wallet
          </h2>
          <button
            onClick={closeConnectModal}
            className="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors duration-100"
            style={{ color: 'var(--probex-text-muted)' }}
            aria-label="Close"
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--probex-text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--probex-text-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Provider list */}
        <div className="p-3 flex flex-col gap-2">
          {MOCK_WALLET_PROVIDERS.map((provider) => {
            const isConnectingThis = connecting === provider.id
            return (
              <button
                key={provider.id}
                onClick={() => handleConnect(provider.id)}
                disabled={connecting !== null}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg text-left cursor-pointer transition-colors duration-100',
                  'disabled:cursor-not-allowed',
                )}
                style={{
                  background: 'var(--probex-surface-2)',
                  border:     '1px solid var(--probex-border)',
                  opacity:    connecting !== null && !isConnectingThis ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (connecting === null) e.currentTarget.style.borderColor = 'var(--probex-border-active)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--probex-border)'
                }}
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'var(--probex-surface-3)' }}
                  aria-hidden="true"
                >
                  {provider.iconLabel}
                </span>
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--probex-text-primary)' }}>
                      {provider.name}
                    </span>
                    {provider.isInstalled && (
                      <span className="text-2xs font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--probex-positive-dim)', color: 'var(--probex-positive)' }}>
                        Detected
                      </span>
                    )}
                  </div>
                  <span className="text-2xs leading-snug" style={{ color: 'var(--probex-text-muted)' }}>
                    {provider.description}
                  </span>
                </div>
                {isConnectingThis && (
                  <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: 'var(--probex-primary)' }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>

        {/* Footer note */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--probex-border)', background: 'var(--probex-surface-2)' }}>
          <p className="text-2xs leading-relaxed" style={{ color: 'var(--probex-text-disabled)' }}>
            Demo mode — no real wallet connections are made in this build.
          </p>
        </div>
      </div>
    </div>
  )
}
