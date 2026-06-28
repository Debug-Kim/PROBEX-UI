import type { WalletAddress } from '@/types/branded'

/**
 * Truncates a wallet address for display.
 * "0x4a3f2b1c...d92c" format.
 *
 * @param address  Full wallet address
 * @param chars    Characters to show at start/end (default: 4)
 */
export function formatAddress(address: WalletAddress | string, chars = 4): string {
  if (!address) return ''
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Formats an address for clipboard copy (always returns full address).
 */
export function fullAddress(address: WalletAddress | string): string {
  return address
}

/**
 * Returns a block explorer URL for an address.
 *
 * @param address     Wallet or contract address
 * @param explorerUrl Base explorer URL (e.g. "https://polygonscan.com")
 */
export function explorerAddressUrl(
  address: WalletAddress | string,
  explorerUrl: string,
): string {
  return `${explorerUrl}/address/${address}`
}

/**
 * Returns a block explorer URL for a transaction hash.
 *
 * @param txHash      Transaction hash
 * @param explorerUrl Base explorer URL
 */
export function explorerTxUrl(txHash: string, explorerUrl: string): string {
  return `${explorerUrl}/tx/${txHash}`
}
