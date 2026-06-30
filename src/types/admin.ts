import type { UserRole, KYCStatus } from '@/types/user'

export type AdminUserStatus = 'active' | 'suspended' | 'pending' | 'banned'

export interface AdminUser {
  id:             string
  name:           string
  email:          string
  role:           UserRole
  status:         AdminUserStatus
  kyc:            KYCStatus
  country:        string
  balanceUsd:     number
  lifetimeVolume: number
  joinedAt:       string
  lastActiveAt:   string
}

export type AdminMarketStatus = 'open' | 'paused' | 'resolved' | 'flagged' | 'draft'

export interface AdminMarket {
  id:           string
  question:     string
  category:     string
  status:       AdminMarketStatus
  volumeUsd:    number
  openInterest: number
  traders:      number
  yesPrice:     number
  closesAt:     string
  flagged?:     string
}

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

export interface RiskMetric {
  label: string
  value: string
  delta: number
  level: 'ok' | 'elevated' | 'critical'
  hint:  string
}

export interface RiskAlert {
  id:       string
  market:   string
  type:     string
  detail:   string
  severity: AuditSeverity
  at:       string
}

export interface KYCApplication {
  id:           string
  userId:       string
  name:         string
  country:      string
  documentType: 'passport' | 'national-id' | 'drivers-license'
  submittedAt:  string
  status:       Extract<KYCStatus, 'pending' | 'requires_review'>
  riskScore:    number
  flags:        string[]
}

export type ServiceState = 'operational' | 'degraded' | 'down'

export interface ServiceStatus {
  name:      string
  state:     ServiceState
  latencyMs: number
  uptime:    number
}

export interface SystemMetric {
  label: string
  value: string
  delta: number
}

export interface AdminKPIs {
  totalUsers:     number
  activeMarkets:  number
  pendingKyc:     number
  openRiskAlerts: number
}

export interface SystemHealth {
  services:   ServiceStatus[]
  metrics:    SystemMetric[]
  throughput: Array<{ t: string; rpm: number }>
}

export interface RiskDashboard {
  metrics:        RiskMetric[]
  alerts:         RiskAlert[]
  exposureSeries: Array<{ day: string; exposure: number }>
}
