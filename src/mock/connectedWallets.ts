// Mock wallet connector metadata for the ConnectWalletModal.
// wagmi connector registry (see lib/web3/providers).

import type { WalletProvider, NetworkId } from '@/types/wallet'
import { asWalletAddress } from '@/types/branded'

export interface WalletProviderMeta {
  id:          WalletProvider
  name:        string
  description: string
  iconLabel:   string   // short label used as icon badge
  isInstalled: boolean  // mock "detected in browser" state
}

export const MOCK_WALLET_PROVIDERS: WalletProviderMeta[] = [
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

// ─── Currently connected wallet ────────────────────────────────────────────

export interface ConnectedWalletInfo {
  provider:    WalletProvider
  address:     ReturnType<typeof asWalletAddress>
  networkId:   NetworkId
  connectedAt: string
  lastActiveAt: string
  ensName?:    string
}

export const MOCK_CONNECTED_WALLET: ConnectedWalletInfo = {
  provider:     'metamask',
  address:      asWalletAddress('0x4a3f2b1c9e7d8a6f5c3b2e1d0a9c8b7e6f5d4c3b'),
  networkId:    137,
  connectedAt:  '2026-01-20T09:15:00Z',
  lastActiveAt: new Date(Date.now() - 1_800_000).toISOString(),
}

export const NETWORK_LABELS: Record<NetworkId, string> = {
  137:   'Polygon',
  80002: 'Polygon Amoy (Testnet)',
}

export const PROVIDER_LABELS: Record<WalletProvider, string> = {
  metamask:      'MetaMask',
  walletconnect: 'WalletConnect',
  coinbase:      'Coinbase Wallet',
}

export const PROVIDER_ICONS: Record<WalletProvider, string> = {
  metamask:      '🦊',
  walletconnect: '🔗',
  coinbase:      '🔵',
}
