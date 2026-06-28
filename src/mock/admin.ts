/**
 * Admin Console mock data
 *
 * Self-contained dataset for the six admin panels, with types local to this
 * module. Data is deterministic (no Math.random at module scope) so SSR and
 * client render identically — avoids hydration mismatches.
 */

import type { UserRole, KYCStatus } from '@/types/user'

// ─── Users ──────────────────────────────────────────────────────────────────

export type AdminUserStatus = 'active' | 'suspended' | 'pending' | 'banned'

export interface AdminUser {
  id:           string
  name:         string
  email:        string
  role:         UserRole
  status:       AdminUserStatus
  kyc:          KYCStatus
  country:      string
  balanceUsd:   number
  lifetimeVolume: number
  joinedAt:     string
  lastActiveAt: string
}

export const ADMIN_USERS: AdminUser[] = [
  { id: 'usr_8f21', name: 'Alex Reeves',     email: 'alex@probex.io',       role: 'professional', status: 'active',    kyc: 'approved',        country: 'US', balanceUsd: 42_180.55, lifetimeVolume: 1_284_900, joinedAt: '2025-01-15T00:00:00Z', lastActiveAt: '2026-06-27T13:42:00Z' },
  { id: 'usr_3b09', name: 'Mei Tanaka',      email: 'mei.t@gmail.com',      role: 'retail',       status: 'active',    kyc: 'approved',        country: 'JP', balanceUsd: 3_420.10,  lifetimeVolume: 88_400,    joinedAt: '2025-03-22T00:00:00Z', lastActiveAt: '2026-06-27T09:10:00Z' },
  { id: 'usr_d471', name: 'Daniel Okafor',   email: 'd.okafor@proton.me',   role: 'retail',       status: 'pending',   kyc: 'requires_review', country: 'NG', balanceUsd: 0,         lifetimeVolume: 0,         joinedAt: '2026-06-26T00:00:00Z', lastActiveAt: '2026-06-26T22:30:00Z' },
  { id: 'usr_a2c8', name: 'Sofia Marenco',   email: 'sofia.m@outlook.com',  role: 'professional', status: 'active',    kyc: 'approved',        country: 'IT', balanceUsd: 18_905.00, lifetimeVolume: 540_220,   joinedAt: '2025-02-08T00:00:00Z', lastActiveAt: '2026-06-27T11:55:00Z' },
  { id: 'usr_77fe', name: 'Liam Cooper',     email: 'liam.cooper@me.com',   role: 'retail',       status: 'suspended', kyc: 'rejected',        country: 'GB', balanceUsd: 210.45,    lifetimeVolume: 12_300,    joinedAt: '2025-09-30T00:00:00Z', lastActiveAt: '2026-06-20T08:00:00Z' },
  { id: 'usr_5e10', name: 'Priya Nair',      email: 'priya.nair@gmail.com', role: 'retail',       status: 'active',    kyc: 'pending',         country: 'IN', balanceUsd: 1_050.00,  lifetimeVolume: 4_900,     joinedAt: '2026-05-11T00:00:00Z', lastActiveAt: '2026-06-27T07:20:00Z' },
  { id: 'usr_9b3d', name: 'Marco Visser',    email: 'm.visser@ziggo.nl',    role: 'professional', status: 'active',    kyc: 'approved',        country: 'NL', balanceUsd: 76_500.80, lifetimeVolume: 2_104_000, joinedAt: '2024-11-02T00:00:00Z', lastActiveAt: '2026-06-27T12:00:00Z' },
  { id: 'usr_c0a1', name: 'Grace Lee',       email: 'grace.lee@kakao.com',  role: 'retail',       status: 'active',    kyc: 'approved',        country: 'KR', balanceUsd: 8_200.00,  lifetimeVolume: 162_500,   joinedAt: '2025-06-18T00:00:00Z', lastActiveAt: '2026-06-26T19:45:00Z' },
  { id: 'usr_4d7b', name: 'Omar Haddad',     email: 'omar.h@gmail.com',     role: 'retail',       status: 'banned',    kyc: 'rejected',        country: 'AE', balanceUsd: 0,         lifetimeVolume: 33_100,    joinedAt: '2025-04-14T00:00:00Z', lastActiveAt: '2026-05-02T14:00:00Z' },
  { id: 'usr_e6f2', name: 'Hannah Schmidt',  email: 'h.schmidt@web.de',     role: 'professional', status: 'active',    kyc: 'approved',        country: 'DE', balanceUsd: 29_740.25, lifetimeVolume: 712_800,   joinedAt: '2025-01-29T00:00:00Z', lastActiveAt: '2026-06-27T10:33:00Z' },
  { id: 'usr_1a8c', name: 'Carlos Mendes',   email: 'c.mendes@uol.com.br',  role: 'retail',       status: 'pending',   kyc: 'requires_review', country: 'BR', balanceUsd: 0,         lifetimeVolume: 0,         joinedAt: '2026-06-27T00:00:00Z', lastActiveAt: '2026-06-27T06:15:00Z' },
  { id: 'usr_b3e9', name: 'Yuki Sato',       email: 'yuki.sato@icloud.com', role: 'retail',       status: 'active',    kyc: 'approved',        country: 'JP', balanceUsd: 5_680.00,  lifetimeVolume: 94_300,    joinedAt: '2025-08-07T00:00:00Z', lastActiveAt: '2026-06-25T16:20:00Z' },
]

// ─── Markets (admin view) ─────────────────────────────────────────────────

export type AdminMarketStatus = 'open' | 'paused' | 'resolved' | 'flagged' | 'draft'

export interface AdminMarket {
  id:          string
  question:    string
  category:    string
  status:      AdminMarketStatus
  volumeUsd:   number
  openInterest: number
  traders:     number
  yesPrice:    number  // cents
  closesAt:    string
  flagged?:    string  // reason, if flagged
}

export const ADMIN_MARKETS: AdminMarket[] = [
  { id: 'mkt_btc150', question: 'Will BTC close above $150K by Dec 31, 2026?', category: 'Price',      status: 'open',     volumeUsd: 4_820_000, openInterest: 1_240_000, traders: 8_420, yesPrice: 38, closesAt: '2026-12-31T23:59:00Z' },
  { id: 'mkt_etf',    question: 'Will spot BTC ETF AUM exceed $200B in Q3?',  category: 'ETF',        status: 'open',     volumeUsd: 2_140_000, openInterest: 680_000,   traders: 4_110, yesPrice: 61, closesAt: '2026-09-30T23:59:00Z' },
  { id: 'mkt_halv',   question: 'Will hashrate set an ATH this quarter?',     category: 'On-Chain',   status: 'open',     volumeUsd: 980_000,   openInterest: 312_000,   traders: 2_050, yesPrice: 74, closesAt: '2026-09-30T23:59:00Z' },
  { id: 'mkt_fed',    question: 'Will the Fed cut rates at the July meeting?', category: 'Macro',      status: 'paused',   volumeUsd: 3_310_000, openInterest: 1_020_000, traders: 6_240, yesPrice: 52, closesAt: '2026-07-31T18:00:00Z' },
  { id: 'mkt_etf2',   question: 'Will a new Solana ETF be approved in 2026?', category: 'ETF',        status: 'flagged',  volumeUsd: 1_450_000, openInterest: 440_000,   traders: 3_100, yesPrice: 29, closesAt: '2026-12-31T23:59:00Z', flagged: 'Unusual volume spike — 14× 24h avg' },
  { id: 'mkt_mstr',   question: 'Will MicroStrategy add >50K BTC in Q3?',     category: 'Institutional', status: 'open',  volumeUsd: 760_000,   openInterest: 198_000,   traders: 1_480, yesPrice: 44, closesAt: '2026-09-30T23:59:00Z' },
  { id: 'mkt_reg',    question: 'Will the US pass a stablecoin bill by EOY?', category: 'Regulation', status: 'open',     volumeUsd: 1_910_000, openInterest: 590_000,   traders: 3_870, yesPrice: 57, closesAt: '2026-12-31T23:59:00Z' },
  { id: 'mkt_q2',     question: 'Did BTC close Q2 above $110K?',              category: 'Price',      status: 'resolved', volumeUsd: 5_640_000, openInterest: 0,         traders: 9_900, yesPrice: 100, closesAt: '2026-06-30T23:59:00Z' },
  { id: 'mkt_draft',  question: 'Will Lightning capacity exceed 8K BTC?',     category: 'On-Chain',   status: 'draft',    volumeUsd: 0,         openInterest: 0,         traders: 0,     yesPrice: 50, closesAt: '2026-10-31T23:59:00Z' },
]

// ─── Audit log ──────────────────────────────────────────────────────────────

export type AuditSeverity = 'info' | 'warning' | 'critical'

export interface AuditEntry {
  id:        string
  timestamp: string
  actor:     string
  action:    string
  target:    string
  severity:  AuditSeverity
  ip:        string
}

export const AUDIT_LOG: AuditEntry[] = [
  { id: 'a1', timestamp: '2026-06-27T13:40:12Z', actor: 'admin@probex.io',  action: 'market.pause',        target: 'mkt_fed',     severity: 'warning',  ip: '10.2.4.81' },
  { id: 'a2', timestamp: '2026-06-27T13:22:55Z', actor: 'system',           action: 'risk.alert',          target: 'mkt_etf2',    severity: 'critical', ip: '—' },
  { id: 'a3', timestamp: '2026-06-27T12:58:03Z', actor: 'admin@probex.io',  action: 'user.kyc.approve',    target: 'usr_5e10',    severity: 'info',     ip: '10.2.4.81' },
  { id: 'a4', timestamp: '2026-06-27T12:30:41Z', actor: 'ops@probex.io',    action: 'user.suspend',        target: 'usr_77fe',    severity: 'warning',  ip: '10.2.4.92' },
  { id: 'a5', timestamp: '2026-06-27T11:47:19Z', actor: 'admin@probex.io',  action: 'settings.update',     target: 'fee_bps',     severity: 'info',     ip: '10.2.4.81' },
  { id: 'a6', timestamp: '2026-06-27T10:15:08Z', actor: 'system',           action: 'auth.login.failed',   target: 'usr_4d7b',    severity: 'warning',  ip: '203.0.113.7' },
  { id: 'a7', timestamp: '2026-06-27T09:02:33Z', actor: 'ops@probex.io',    action: 'user.ban',            target: 'usr_4d7b',    severity: 'critical', ip: '10.2.4.92' },
  { id: 'a8', timestamp: '2026-06-26T22:40:00Z', actor: 'admin@probex.io',  action: 'market.resolve',      target: 'mkt_q2',      severity: 'info',     ip: '10.2.4.81' },
  { id: 'a9', timestamp: '2026-06-26T20:11:27Z', actor: 'system',           action: 'wallet.withdraw.hold', target: 'usr_9b3d',   severity: 'warning',  ip: '—' },
  { id: 'a10', timestamp: '2026-06-26T18:05:44Z', actor: 'admin@probex.io', action: 'market.create',       target: 'mkt_draft',   severity: 'info',     ip: '10.2.4.81' },
]

// ─── Risk dashboard ───────────────────────────────────────────────────────

export interface RiskMetric {
  label:   string
  value:   string
  delta:   number     // fraction, e.g. 0.12 = +12%
  level:   'ok' | 'elevated' | 'critical'
  hint:    string
}

export const RISK_METRICS: RiskMetric[] = [
  { label: 'Platform Exposure',   value: '$12.4M', delta:  0.08, level: 'elevated', hint: 'Net open liability across all markets' },
  { label: 'Largest Position',    value: '$840K',  delta:  0.31, level: 'critical', hint: 'usr_9b3d on mkt_btc150 — 6.8% of book' },
  { label: 'Margin Utilization',  value: '63%',    delta: -0.04, level: 'ok',       hint: 'Collateral deployed vs. available' },
  { label: 'Settlement Reserve',  value: '$4.1M',  delta:  0.02, level: 'ok',       hint: 'Funds escrowed for pending resolutions' },
]

export interface RiskAlert {
  id:       string
  market:   string
  type:     string
  detail:   string
  severity: AuditSeverity
  at:       string
}

export const RISK_ALERTS: RiskAlert[] = [
  { id: 'r1', market: 'mkt_etf2',   type: 'Volume anomaly',   detail: '24h volume 14× trailing average — possible coordinated activity', severity: 'critical', at: '2026-06-27T13:22:00Z' },
  { id: 'r2', market: 'mkt_btc150', type: 'Concentration',    detail: 'Single account holds 6.8% of open interest',                      severity: 'warning',  at: '2026-06-27T11:05:00Z' },
  { id: 'r3', market: 'mkt_fed',    type: 'Oracle latency',    detail: 'Macro data feed delayed 42s past SLA threshold',                  severity: 'warning',  at: '2026-06-27T10:48:00Z' },
]

/** Daily platform exposure ($M), trailing 14 days — for the risk sparkline. */
export const EXPOSURE_SERIES: Array<{ day: string; exposure: number }> = [
  { day: 'Jun 14', exposure: 9.8 },  { day: 'Jun 15', exposure: 10.1 }, { day: 'Jun 16', exposure: 10.4 },
  { day: 'Jun 17', exposure: 10.2 }, { day: 'Jun 18', exposure: 10.9 }, { day: 'Jun 19', exposure: 11.3 },
  { day: 'Jun 20', exposure: 11.1 }, { day: 'Jun 21', exposure: 11.6 }, { day: 'Jun 22', exposure: 11.4 },
  { day: 'Jun 23', exposure: 11.9 }, { day: 'Jun 24', exposure: 12.0 }, { day: 'Jun 25', exposure: 12.2 },
  { day: 'Jun 26', exposure: 12.1 }, { day: 'Jun 27', exposure: 12.4 },
]

// ─── KYC review queue ─────────────────────────────────────────────────────

export interface KYCApplication {
  id:          string
  userId:      string
  name:        string
  country:     string
  documentType: 'passport' | 'national-id' | 'drivers-license'
  submittedAt: string
  status:      Extract<KYCStatus, 'pending' | 'requires_review'>
  riskScore:   number  // 0–100, higher = riskier
  flags:       string[]
}

export const KYC_QUEUE: KYCApplication[] = [
  { id: 'kyc_01', userId: 'usr_d471', name: 'Daniel Okafor',  country: 'NG', documentType: 'passport',        submittedAt: '2026-06-26T22:30:00Z', status: 'requires_review', riskScore: 72, flags: ['High-risk jurisdiction', 'Document glare detected'] },
  { id: 'kyc_02', userId: 'usr_1a8c', name: 'Carlos Mendes',  country: 'BR', documentType: 'national-id',     submittedAt: '2026-06-27T06:15:00Z', status: 'requires_review', riskScore: 41, flags: ['Name mismatch on selfie'] },
  { id: 'kyc_03', userId: 'usr_5e10', name: 'Priya Nair',     country: 'IN', documentType: 'drivers-license', submittedAt: '2026-06-25T14:00:00Z', status: 'pending',         riskScore: 18, flags: [] },
  { id: 'kyc_04', userId: 'usr_xx12', name: 'Tomás Herrera',  country: 'MX', documentType: 'passport',        submittedAt: '2026-06-27T03:42:00Z', status: 'pending',         riskScore: 25, flags: [] },
  { id: 'kyc_05', userId: 'usr_yy88', name: 'Fatima Zahra',   country: 'MA', documentType: 'national-id',     submittedAt: '2026-06-24T19:20:00Z', status: 'requires_review', riskScore: 66, flags: ['Expired document', 'Address unverified'] },
]

// ─── System health ────────────────────────────────────────────────────────

export type ServiceState = 'operational' | 'degraded' | 'down'

export interface ServiceStatus {
  name:      string
  state:     ServiceState
  latencyMs: number
  uptime:    number  // fraction, e.g. 0.9998
}

export const SERVICE_STATUS: ServiceStatus[] = [
  { name: 'API Gateway',        state: 'operational', latencyMs: 42,  uptime: 0.99987 },
  { name: 'Market Engine',      state: 'operational', latencyMs: 18,  uptime: 0.99995 },
  { name: 'Consensus Pipeline', state: 'degraded',    latencyMs: 310, uptime: 0.9981 },
  { name: 'Realtime Stream',    state: 'operational', latencyMs: 64,  uptime: 0.9992 },
  { name: 'Wallet / Settlement', state: 'operational', latencyMs: 88, uptime: 0.99978 },
  { name: 'KYC Provider',       state: 'operational', latencyMs: 540, uptime: 0.9975 },
  { name: 'Data Warehouse',     state: 'down',        latencyMs: 0,   uptime: 0.9740 },
]

export interface SystemMetric {
  label: string
  value: string
  delta: number
}

export const SYSTEM_METRICS: SystemMetric[] = [
  { label: 'Requests / min', value: '48.2K', delta:  0.06 },
  { label: 'Error rate',     value: '0.04%', delta: -0.18 },
  { label: 'P95 latency',    value: '120ms', delta:  0.03 },
  { label: 'Active sessions', value: '9,840', delta: 0.11 },
]

/** Requests-per-minute, trailing 24 points (~last 2h) for the throughput chart. */
export const THROUGHPUT_SERIES: Array<{ t: string; rpm: number }> = Array.from({ length: 24 }, (_, i) => {
  // Deterministic gentle wave so SSR/CSR match.
  const base = 44_000 + Math.round(6_000 * Math.sin(i / 3.2))
  return { t: `${String(i).padStart(2, '0')}:00`, rpm: base + (i % 5) * 320 }
})

// ─── Aggregate KPIs (console header) ──────────────────────────────────────

export const ADMIN_KPIS = {
  totalUsers:     28_412,  // platform total (mock — table shows a sample page)
  activeMarkets:  ADMIN_MARKETS.filter((m) => m.status === 'open').length,
  pendingKyc:     KYC_QUEUE.length,
  openRiskAlerts: RISK_ALERTS.length,
}
