// Branded ID types
export type {
  MarketId,
  UserId,
  OrderId,
  TransactionId,
  PositionId,
  ReportId,
  NotificationId,
  SessionId,
  WalletAddress,
  TxHash,
  BlockNumber,
  Branded,
} from './branded'

export {
  asMarketId,
  asUserId,
  asOrderId,
  asTransactionId,
  asPositionId,
  asReportId,
  asNotificationId,
  asWalletAddress,
  asTxHash,
  asBlockNumber,
} from './branded'

// User types
export type {
  UserRole,
  KYCStatus,
  UserProfile,
  UserPreferences,
} from './user'

// Market types
export type {
  AssetClass,
  MarketStatus,
  BitcoinSegment,
  SentimentBias,
  MarketSortField,
  Market,
} from './market'

// Consensus types
export type {
  ConfidenceLevel,
  SignalLevel,
  Bias,
  ConsensusState,
} from './consensus'

// Wallet types
export type {
  WalletProvider,
  WalletBalance,
  Transaction,
  TransactionType,
  TransactionStatus,
} from './wallet'

// Analytics types
export type {
  AnalyticsTimeframe,
} from './analytics'

// Research types
export type {
  ResearchCategoryId,
  ResearchFormat,
  ResearchSentiment,
  ResearchConfidence,
  ResearchSignal,
  ResearchThesis,
  ResearchSource,
  ResearchReport,
  ResearchFilters,
} from './research'

// Realtime types
export type {
  ConnectionStatus,
  StreamChannel,
  StreamEnvelope,
  StreamEvent,
  StreamEventType,
  LiveMarketDelta,
  GlobalLiveDelta,
  LiveActivityEntry,
  MergedMarketView,
  IMarketStreamService,
} from '@/lib/realtime/types'
