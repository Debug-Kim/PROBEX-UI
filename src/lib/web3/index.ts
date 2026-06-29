// Architecture is established. Implementation activates.
//
// Exports available now:
//   - Type definitions (types/)
//   - Chain configuration (utils/chainConfig)
//   - Address formatting utilities (utils/formatAddress, utils/formatBalance)
//   - Contract address registry (contracts/addresses)
//
// Not yet implemented:
//   - WagmiProvider
//   - useWalletConnection hook
//   - useMarketContract hook
//   - useVaultContract hook

// Types
export type {
  SupportedChainId,
  ChainConfig,
  WalletConnectorId,
  ConnectionStatus,
  Web3ConnectionState,
  TransactionReceipt,
  ContractAddresses,
  ContractSide,
  PlaceOrderParams,
  PlaceOrderResult,
} from './types'

// Chain utilities
export { CHAIN_CONFIG, getActiveChainConfig } from './utils/chainConfig'
export { formatAddress, explorerAddressUrl, explorerTxUrl } from './utils/formatAddress'
export { formatUSDC, formatPOL, usdToUsdc, usdcToUsd } from './utils/formatBalance'

// Contract addresses
export { getContractAddresses, getContractAddress } from './contracts/addresses'
