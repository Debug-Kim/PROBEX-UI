// Contract addresses, loaded from env (never hardcoded). Populated at deployment;
// empty strings before deployment.

import type { ContractAddresses } from '../types'
import type { WalletAddress } from '@/types/branded'
import type { SupportedChainId } from '../types'
import { asWalletAddress } from '@/types/branded'
import {
  POLYGON_MAINNET_CHAIN_ID,
  POLYGON_AMOY_CHAIN_ID,
} from '@/config/constants'

// ─── Address registry ──────────────────────────────────────────────────────

const CONTRACT_ADDRESSES: Record<SupportedChainId, ContractAddresses> = {
  // Polygon Mainnet — populated at production deployment
  [POLYGON_MAINNET_CHAIN_ID]: {
    ProbexMarket: asWalletAddress(process.env.NEXT_PUBLIC_CONTRACT_MARKET_137  ?? ''),
    ProbexVault:  asWalletAddress(process.env.NEXT_PUBLIC_CONTRACT_VAULT_137   ?? ''),
    ProbexToken:  asWalletAddress(process.env.NEXT_PUBLIC_CONTRACT_TOKEN_137   ?? ''),
    USDC:         asWalletAddress('0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'),  // USDC on Polygon mainnet
  },

  // Polygon Amoy Testnet — populated after testnet deployment
  [POLYGON_AMOY_CHAIN_ID]: {
    ProbexMarket: asWalletAddress(process.env.NEXT_PUBLIC_CONTRACT_MARKET_80002 ?? ''),
    ProbexVault:  asWalletAddress(process.env.NEXT_PUBLIC_CONTRACT_VAULT_80002  ?? ''),
    ProbexToken:  asWalletAddress(process.env.NEXT_PUBLIC_CONTRACT_TOKEN_80002  ?? ''),
    USDC:         asWalletAddress(process.env.NEXT_PUBLIC_CONTRACT_USDC_80002   ?? ''),
  },
} as const

/**
 * Returns contract addresses for the specified chain.
 * Throws if addresses are not configured.
 */
export function getContractAddresses(chainId: SupportedChainId): ContractAddresses {
  const addresses = CONTRACT_ADDRESSES[chainId]
  if (!addresses) {
    throw new Error(`[contracts] No addresses configured for chainId: ${chainId}`)
  }
  return addresses
}

/**
 * Returns a specific contract address.
 *
 * @example
 *   const vaultAddress = getContractAddress(137, 'ProbexVault')
 */
export function getContractAddress(
  chainId:      SupportedChainId,
  contractName: keyof ContractAddresses,
): WalletAddress {
  return getContractAddresses(chainId)[contractName]
}
