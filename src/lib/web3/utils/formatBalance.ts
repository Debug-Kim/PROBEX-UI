/**
 * Token balance formatting utilities
 * ────────────────────────────────────
 * Converts raw on-chain bigint balances to human-readable strings.
 * All token amounts on Polygon are stored with full precision (bigint).
 */

/**
 * Formats a USDC balance (6 decimals) as a USD string.
 * e.g. 1_000_000n → "$1.00"
 */
export function formatUSDC(rawAmount: bigint, compact = false): string {
  const float = Number(rawAmount) / 1_000_000

  if (compact && float >= 1_000_000) {
    return `$${(float / 1_000_000).toFixed(2)}M`
  }
  if (compact && float >= 1_000) {
    return `$${(float / 1_000).toFixed(1)}K`
  }

  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(float)
}

/**
 * Formats a POL/MATIC balance (18 decimals) as a display string.
 * e.g. 1_500_000_000_000_000_000n → "1.5 POL"
 */
export function formatPOL(rawAmount: bigint, decimals = 4): string {
  const float = Number(rawAmount) / 1e18
  return `${float.toFixed(decimals)} POL`
}

/**
 * Converts a USD float to USDC bigint (6 decimals).
 * e.g. 1.50 → 1_500_000n
 */
export function usdToUsdc(amountUsd: number): bigint {
  return BigInt(Math.round(amountUsd * 1_000_000))
}

/**
 * Converts USDC bigint to USD float.
 * e.g. 1_500_000n → 1.5
 */
export function usdcToUsd(rawAmount: bigint): number {
  return Number(rawAmount) / 1_000_000
}
