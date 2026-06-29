// Centralised network config for all Polygon interactions.
// Never hardcode RPC URLs or chain IDs in components.
//
// Supported networks:
//   - Polygon Mainnet (chainId: 137)
//   - Polygon Amoy Testnet (chainId: 80002)
//     Note: Amoy replaced the deprecated Mumbai testnet.

import type { ChainConfig, SupportedChainId } from '../types'
import {
  POLYGON_MAINNET_CHAIN_ID,
  POLYGON_AMOY_CHAIN_ID,
} from '@/config/constants'

export const CHAIN_CONFIG: Record<SupportedChainId, ChainConfig> = {
  [POLYGON_MAINNET_CHAIN_ID]: {
    chainId:   137,
    name:      'Polygon',
    shortName: 'polygon',
    nativeCurrency: {
      name:     'POL',
      symbol:   'POL',
      decimals: 18,
    },
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc-mainnet.matic.network',
      'https://matic-mainnet.chainstacklabs.com',
    ],
    blockExplorerUrl: 'https://polygonscan.com',
    isTestnet: false,
  },

  [POLYGON_AMOY_CHAIN_ID]: {
    chainId:   80002,
    name:      'Polygon Amoy',
    shortName: 'amoy',
    nativeCurrency: {
      name:     'POL',
      symbol:   'POL',
      decimals: 18,
    },
    rpcUrls: [
      'https://rpc-amoy.polygon.technology',
      'https://polygon-amoy.drpc.org',
    ],
    blockExplorerUrl: 'https://amoy.polygonscan.com',
    isTestnet: true,
  },
} as const satisfies Record<SupportedChainId, ChainConfig>

/**
 * Returns the active chain config based on NEXT_PUBLIC_CHAIN_ID.
 * Defaults to Amoy testnet if env var is not set or invalid.
 */
export function getActiveChainConfig(): ChainConfig {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? POLYGON_AMOY_CHAIN_ID)

  if (chainId === POLYGON_MAINNET_CHAIN_ID) return CHAIN_CONFIG[POLYGON_MAINNET_CHAIN_ID]
  if (chainId === POLYGON_AMOY_CHAIN_ID)    return CHAIN_CONFIG[POLYGON_AMOY_CHAIN_ID]

  console.warn(
    `[chainConfig] Unknown NEXT_PUBLIC_CHAIN_ID: ${chainId}. Falling back to Amoy testnet.`
  )
  return CHAIN_CONFIG[POLYGON_AMOY_CHAIN_ID]
}
