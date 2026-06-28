import type { Metadata } from 'next'
import { WalletPage }    from '@/components/wallet/WalletPage'

export const metadata: Metadata = {
  title:       'Wallet — Probex',
  description: 'Manage balances, connect wallets, deposit and withdraw USDC on Polygon.',
}

/**
 * Wallet page — /dashboard/wallet
 * Complete wallet & funding experience.
 * UI-only — no real blockchain integration.
 * All data from mock/wallet.ts, mock/transactions.ts, mock/fundingMethods.ts.
 * connects to Polygon via Wagmi and real USDC transfers.
 */
export default function Page() {
  return <WalletPage />
}
