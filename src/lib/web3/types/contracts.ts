/**
 * Probex Smart Contract Type Definitions
 * ───────────────────────────────────────
 * Type-safe representations of Probex on-chain contract interfaces.
 * These types mirror the Solidity function signatures and event definitions.
 *
 * Contracts:
 *   ProbexMarket  — prediction market order placement and settlement
 *   ProbexVault   — collateral (USDC) management and withdrawal
 *   ProbexToken   — ERC-20 position token for YES/NO shares
 *
 * No ABIs are defined here — they live in /contracts/abis/*.json.
 * TypeScript types are kept separate from ABI JSON for cleaner imports.
 */

import type { WalletAddress, TxHash, MarketId } from '@/types/branded'
import type { TransactionReceipt, ContractCallOptions } from './wallet'

// ─── Contract addresses ───────────────────────────────────────────────────
// Populated from environment variables at runtime, not hardcoded.

export interface ContractAddresses {
  ProbexMarket: WalletAddress
  ProbexVault:  WalletAddress
  ProbexToken:  WalletAddress
  USDC:         WalletAddress
}

// ─── ProbexMarket contract ────────────────────────────────────────────────

export type ContractSide = 0 | 1  // 0 = YES, 1 = NO

export interface PlaceOrderParams {
  marketId:    MarketId     // bytes32 on-chain
  side:        ContractSide
  amountUsdc:  bigint       // 6 decimals
  minContracts: bigint      // slippage protection
}

export interface PlaceOrderResult {
  txHash:     TxHash
  receipt:    TransactionReceipt
  orderId:    string        // bytes32 from event log
  contracts:  bigint
}

export interface SettleMarketParams {
  marketId:   MarketId
  outcome:    ContractSide
}

// ─── ProbexVault contract ─────────────────────────────────────────────────

export interface DepositParams {
  amountUsdc:  bigint  // 6 decimals
  options?:    ContractCallOptions
}

export interface WithdrawParams {
  amountUsdc:  bigint  // 6 decimals
  to:          WalletAddress
  options?:    ContractCallOptions
}

// ─── On-chain events ──────────────────────────────────────────────────────

export interface OrderPlacedEvent {
  orderId:    string
  marketId:   MarketId
  trader:     WalletAddress
  side:       ContractSide
  contracts:  bigint
  price:      bigint  // scaled by 1e6
  timestamp:  bigint
}

export interface MarketSettledEvent {
  marketId:   MarketId
  outcome:    ContractSide
  timestamp:  bigint
}

export interface DepositEvent {
  user:       WalletAddress
  amount:     bigint
  timestamp:  bigint
}
