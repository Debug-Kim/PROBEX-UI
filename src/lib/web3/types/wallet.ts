// These types are used by web3 hooks, wallet service, and contract interactions.
// Defined here to decouple from any specific wallet library (wagmi, ethers, etc.)
// so the UI layer never needs to import from wallet SDKs directly.

import type { WalletAddress, TxHash, BlockNumber } from '@/types/branded'

// ─── Network / Chain ──────────────────────────────────────────────────────

export const SUPPORTED_CHAIN_IDS = [137, 80002] as const
export type  SupportedChainId    = (typeof SUPPORTED_CHAIN_IDS)[number]

export interface ChainConfig {
  readonly chainId:      SupportedChainId
  readonly name:         string
  readonly shortName:    string
  readonly nativeCurrency: {
    readonly name:     string
    readonly symbol:   string
    readonly decimals: 18
  }
  readonly rpcUrls:          readonly string[]
  readonly blockExplorerUrl: string
  readonly isTestnet:        boolean
}

// ─── Wallet connector types ───────────────────────────────────────────────

export type WalletConnectorId = 'metamask' | 'walletconnect' | 'coinbase'

export interface WalletConnectorMeta {
  readonly id:          WalletConnectorId
  readonly name:        string
  readonly description: string
  readonly iconUrl:     string
  readonly isAvailable: () => boolean
}

// ─── Connection state ─────────────────────────────────────────────────────

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'

export interface Web3ConnectionState {
  status:       ConnectionStatus
  address:      WalletAddress | null
  chainId:      SupportedChainId | null
  connectorId:  WalletConnectorId | null
  error:        string | null
}

// ─── Transaction receipt ──────────────────────────────────────────────────

export interface TransactionReceipt {
  txHash:         TxHash
  blockNumber:    BlockNumber
  blockHash:      string
  status:         'success' | 'reverted'
  gasUsed:        bigint
  effectiveGasPrice: bigint
}

// ─── Contract call types ──────────────────────────────────────────────────

export interface ContractCallOptions {
  /** Chain to execute on — defaults to active chain */
  chainId?:   SupportedChainId
  /** Gas limit override */
  gasLimit?:  bigint
  /** Value to send with the call (in wei) */
  value?:     bigint
}

export interface ContractReadOptions {
  chainId?:    SupportedChainId
  blockNumber?: BlockNumber
}
