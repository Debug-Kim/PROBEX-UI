/**
 * Branded types — prevent accidental ID mix-ups at compile time.
 *
 * Usage:
 *   const id = 'btc-150k-dec-2026' as MarketId
 *   function getMarket(id: MarketId): Promise<Market> { ... }
 *   getMarket('plain-string')  // ✗ TypeScript error
 *   getMarket(userId)          // ✗ TypeScript error — wrong brand
 */

declare const __brand: unique symbol

type Brand<B> = { [__brand]: B }

/**
 * Combines a base type T with a brand B to create a nominal type.
 * Values must be explicitly cast — prevents accidental interchangeability.
 */
export type Branded<T, B> = T & Brand<B>

// ─── Entity ID brands ─────────────────────────────────────────────────────

export type MarketId       = Branded<string, 'MarketId'>
export type UserId         = Branded<string, 'UserId'>
export type OrderId        = Branded<string, 'OrderId'>
export type TransactionId  = Branded<string, 'TransactionId'>
export type PositionId     = Branded<string, 'PositionId'>
export type ReportId       = Branded<string, 'ReportId'>
export type NotificationId = Branded<string, 'NotificationId'>
export type SessionId      = Branded<string, 'SessionId'>
export type WalletAddress  = Branded<string, 'WalletAddress'>
export type TxHash         = Branded<string, 'TxHash'>
export type BlockNumber    = Branded<number, 'BlockNumber'>

// ─── Helper factories ─────────────────────────────────────────────────────

export const asMarketId       = (s: string): MarketId       => s as MarketId
export const asUserId         = (s: string): UserId         => s as UserId
export const asOrderId        = (s: string): OrderId        => s as OrderId
export const asTransactionId  = (s: string): TransactionId  => s as TransactionId
export const asPositionId     = (s: string): PositionId     => s as PositionId
export const asReportId       = (s: string): ReportId       => s as ReportId
export const asNotificationId = (s: string): NotificationId => s as NotificationId
export const asWalletAddress  = (s: string): WalletAddress  => s as WalletAddress
export const asTxHash         = (s: string): TxHash         => s as TxHash
export const asBlockNumber    = (n: number): BlockNumber     => n as BlockNumber
