// Mock balances for the connected wallet experience.
// replace with IWalletService.getBalance backed by Polygon RPC.

import type { WalletBalance, WalletConnection, PendingFunds, FundingStatus } from '@/types/wallet'
import { asWalletAddress } from '@/types/branded'
import { computePortfolioSummary } from './portfolio'

export type { PendingFunds, FundingStatus } from '@/types/wallet'

// ─── Mock connected wallet ──────────────────────────────────────────────

export const MOCK_WALLET_CONNECTION: WalletConnection = {
  address:      asWalletAddress('0x4a3f2b1c9e7d8a6f5c3b2e1d0a9c8b7e6f5d4c3b'),
  provider:     'metamask',
  networkId:    137,
  isConnected:  true,
  connectedAt:  '2026-01-20T09:15:00Z',
  lastActiveAt: new Date(Date.now() - 1_800_000).toISOString(),
}

// ─── Mock balance ─────────────────────────────────────────────────────────

/**
 * Computes the current wallet balance.
 * Portfolio value is derived from open positions (mock/portfolio.ts)
 * so the wallet and portfolio pages stay numerically consistent.
 */
export function getMockWalletBalance(): WalletBalance {
  const portfolio = computePortfolioSummary()

  const usdcBalance   = 4_218.42
  const nativeBalance = 12.847  // POL

  return {
    address:        MOCK_WALLET_CONNECTION.address,
    usdcBalance,
    nativeBalance,
    portfolioValue: portfolio.currentValue,
    totalValue:     usdcBalance + portfolio.currentValue,
  }
}

// ─── Pending funds ─────────────────────────────────────────────────────────

export const MOCK_PENDING_FUNDS: PendingFunds = {
  pendingDeposits:    500.00,
  pendingWithdrawals: 250.00,
  depositCount:       1,
  withdrawalCount:    1,
}

// ─── Funding status ─────────────────────────────────────────────────────────

export const MOCK_FUNDING_STATUS: FundingStatus = 'active'

export const FUNDING_STATUS_LABELS: Record<FundingStatus, string> = {
  active:                'Active',
  'pending-verification': 'Pending Verification',
  restricted:            'Restricted',
}

export const FUNDING_STATUS_COLORS: Record<FundingStatus, string> = {
  active:                 'var(--probex-positive)',
  'pending-verification': 'var(--probex-warning)',
  restricted:             'var(--probex-negative)',
}
