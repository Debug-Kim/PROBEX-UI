/**
 * Transaction History Mock Data
 * ───────────────────────────────
 * Combines funding transactions (deposit/withdrawal) with trading
 * settlements already referenced in mock/portfolioActivity.ts.
 *
 * replace with IWalletService.getTransactions backed by
 * Polygon transaction history + indexer.
 */

import type { Transaction, TransactionType, TransactionStatus } from '@/types/wallet'
import { asTransactionId, asTxHash, asMarketId } from '@/types/branded'

const now = Date.now()

function tx(
  id:          string,
  type:        TransactionType,
  amount:      number,
  status:      TransactionStatus,
  hoursAgo:    number,
  opts: {
    marketId?:    string
    marketTitle?: string
    txHash?:      string
    blockNumber?: number
    confirmations?: number
  } = {},
): Transaction {
  const createdAt = new Date(now - hoursAgo * 3_600_000).toISOString()
  return {
    id:           asTransactionId(id),
    type,
    marketId:     opts.marketId ? asMarketId(opts.marketId) : null,
    marketTitle:  opts.marketTitle ?? null,
    amount,
    status,
    txHash:       opts.txHash ? asTxHash(opts.txHash) : null,
    networkId:    137,
    blockNumber:  opts.blockNumber ? opts.blockNumber : null,
    confirmations: opts.confirmations ?? (status === 'confirmed' ? 128 : 0),
    createdAt,
    confirmedAt:  status === 'confirmed' ? createdAt : null,
  }
}

// ─── Mock transactions ──────────────────────────────────────────────────

export const MOCK_TRANSACTIONS: Transaction[] = [
  // Pending deposit — most recent
  tx('txn-001', 'deposit', 500.00, 'pending', 0.5, {
    txHash: '0x8f3e2a1b9c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f',
  }),

  // Pending withdrawal
  tx('txn-002', 'withdrawal', -250.00, 'confirming', 2, {
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    confirmations: 14,
  }),

  // Recent settlements (mirrors portfolioActivity)
  tx('txn-003', 'settlement-win', 600.00, 'confirmed', 18, {
    marketId: 'btc-120k-ath', marketTitle: 'BTC reaches new ATH above $120,000',
    txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    blockNumber: 58_440_812,
  }),

  tx('txn-004', 'buy-yes', -255.50, 'confirmed', 144, {
    marketId: 'btc-difficulty-ath', marketTitle: 'BTC mining difficulty sets new ATH this quarter',
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    blockNumber: 58_392_104,
  }),

  tx('txn-005', 'settlement-win', 400.00, 'confirmed', 96, {
    marketId: 'btc-etf-positive-10wk', marketTitle: 'Net BTC ETF flows positive for 10 consecutive weeks',
    txHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    blockNumber: 58_312_775,
  }),

  tx('txn-006', 'buy-no', -366.00, 'confirmed', 36, {
    marketId: 'btc-sp500-correlation', marketTitle: 'BTC correlation with S&P 500 drops below 0.3 in Q3',
    txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    blockNumber: 58_405_991,
  }),

  // Earlier deposit
  tx('txn-007', 'deposit', 2_000.00, 'confirmed', 240, {
    txHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
    blockNumber: 58_180_442,
  }),

  tx('txn-008', 'settlement-loss', -144.00, 'confirmed', 60, {
    marketId: 'fed-cut-twice-2026', marketTitle: 'Fed cuts rates at least twice before year-end 2026',
    txHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    blockNumber: 58_330_220,
  }),

  tx('txn-009', 'buy-yes', -87.00, 'confirmed', 72, {
    marketId: 'ibit-100b-aum', marketTitle: 'BlackRock IBIT surpasses $100B AUM by year-end',
    txHash: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
    blockNumber: 58_290_115,
  }),

  // Earliest deposit — account funding
  tx('txn-010', 'deposit', 10_000.00, 'confirmed', 3600, {
    txHash: '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    blockNumber: 56_812_330,
  }),

  // Failed withdrawal attempt
  tx('txn-011', 'withdrawal', -100.00, 'failed', 480, {
    txHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
  }),

  tx('txn-012', 'fee', -2.50, 'confirmed', 144, {
    marketId: 'btc-difficulty-ath', marketTitle: 'Trading fee — position open',
    txHash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    blockNumber: 58_392_106,
  }),
]

// ─── Display helpers ─────────────────────────────────────────────────────

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  deposit:          'Deposit',
  withdrawal:       'Withdrawal',
  'buy-yes':        'Buy YES',
  'buy-no':         'Buy NO',
  'sell-yes':       'Sell YES',
  'sell-no':        'Sell NO',
  'settlement-win': 'Settlement (Win)',
  'settlement-loss':'Settlement (Loss)',
  fee:              'Fee',
}

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  deposit:          'var(--probex-positive)',
  withdrawal:       'var(--probex-warning)',
  'buy-yes':        'var(--probex-yes)',
  'buy-no':         'var(--probex-no)',
  'sell-yes':       'var(--probex-yes)',
  'sell-no':        'var(--probex-no)',
  'settlement-win': 'var(--probex-positive)',
  'settlement-loss':'var(--probex-negative)',
  fee:              'var(--probex-text-muted)',
}

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  pending:    'Pending',
  confirming: 'Confirming',
  confirmed:  'Confirmed',
  failed:     'Failed',
}

export const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, string> = {
  pending:    'var(--probex-warning)',
  confirming: 'var(--probex-primary)',
  confirmed:  'var(--probex-positive)',
  failed:     'var(--probex-negative)',
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export function getTransactions(): Transaction[] {
  return [...MOCK_TRANSACTIONS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function getPendingTransactions(): Transaction[] {
  return MOCK_TRANSACTIONS.filter((t) => t.status === 'pending' || t.status === 'confirming')
}
