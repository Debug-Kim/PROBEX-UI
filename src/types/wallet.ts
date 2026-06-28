import type { MarketId, OrderId, PositionId, TransactionId, TxHash, WalletAddress } from './branded'

// ─── Wallet connection ────────────────────────────────────────────────────

export type WalletProvider = 'metamask' | 'walletconnect' | 'coinbase'

export type NetworkId = 137 | 80002  // Polygon mainnet | Amoy testnet

export interface WalletConnection {
  address:    WalletAddress
  provider:   WalletProvider
  networkId:  NetworkId
  isConnected: boolean
  connectedAt: string
}

export interface WalletBalance {
  address:     WalletAddress
  usdcBalance: number   // USDC, 6 decimals normalized to USD float
  nativeBalance: number // MATIC/POL, 18 decimals normalized
  portfolioValue: number // open positions value in USD
  totalValue:  number   // usdcBalance + portfolioValue
}

// ─── Transaction ──────────────────────────────────────────────────────────

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'buy-yes'
  | 'buy-no'
  | 'sell-yes'
  | 'sell-no'
  | 'settlement-win'
  | 'settlement-loss'
  | 'fee'

export type TransactionStatus = 'pending' | 'confirming' | 'confirmed' | 'failed'

export interface Transaction {
  readonly id:      TransactionId
  type:             TransactionType
  marketId:         MarketId | null  // null for deposits/withdrawals
  marketTitle:      string | null
  amount:           number           // USD
  status:           TransactionStatus
  txHash:           TxHash | null
  networkId:        NetworkId
  blockNumber:      number | null
  confirmations:    number
  createdAt:        string
  confirmedAt:      string | null
}

// ─── Transaction state machine ─────────────────────────────────────────── 
// (Architecture review recommendation)

export type TxPhase =
  | { phase: 'idle' }
  | { phase: 'awaiting-signature' }
  | { phase: 'broadcasting'; txHash: TxHash }
  | { phase: 'confirming'; txHash: TxHash; confirmations: number }
  | { phase: 'confirmed'; txHash: TxHash }
  | { phase: 'failed'; txHash?: TxHash; error: string }

// ─── Positions ────────────────────────────────────────────────────────────

export type PositionSide = 'yes' | 'no'

export type PositionStatus = 'open' | 'settled-win' | 'settled-loss' | 'sold'

export interface Position {
  readonly id:   PositionId
  marketId:      MarketId
  marketTitle:   string
  segment:       string
  side:          PositionSide
  contracts:     number
  entryPrice:    number   // cents
  currentPrice:  number   // cents, updated live
  costBasis:     number   // USD
  currentValue:  number   // USD
  unrealizedPnl: number   // USD
  unrealizedPnlPct: number // -1 to 1
  status:        PositionStatus
  openedAt:      string
  closedAt:      string | null
  orderId:       OrderId
}

// ─── Wallet store state ───────────────────────────────────────────────────

export interface WalletState {
  connection:    WalletConnection | null
  balance:       WalletBalance | null
  positions:     Position[]
  transactions:  Transaction[]
 pendingTx: TxPhase
  isConnecting:  boolean
}
