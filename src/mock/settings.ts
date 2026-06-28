/**
 * Settings Mock Data
 * ──────────────────
 * Demo data + default preference shapes for the Settings platform.
 * Backend wiring (persistence, auth, KYC, API keys) lands in later sprints —
 * these defaults drive the UI locally in the meantime.
 */

// ─── Sessions & devices ─────────────────────────────────────────────────────

export interface DeviceSession {
  id:         string
  device:     string
  browser:    string
  location:   string
  ipMasked:   string
  lastActive: string
  current:    boolean
}

export const MOCK_SESSIONS: DeviceSession[] = [
  { id: 'sess_cur', device: 'MacBook Pro 16"', browser: 'Chrome 140',     location: 'New York, US', ipMasked: '72.21.•••.4',  lastActive: 'Active now',   current: true  },
  { id: 'sess_2',   device: 'iPhone 16 Pro',   browser: 'Safari Mobile',  location: 'New York, US', ipMasked: '72.21.•••.9',  lastActive: '2 hours ago',  current: false },
  { id: 'sess_3',   device: 'Windows Desktop', browser: 'Edge 139',       location: 'London, GB',   ipMasked: '81.2.•••.33',  lastActive: 'Yesterday',    current: false },
  { id: 'sess_4',   device: 'iPad Air',        browser: 'Safari',         location: 'New York, US', ipMasked: '72.21.•••.1',  lastActive: '4 days ago',   current: false },
]

// ─── Option lists ───────────────────────────────────────────────────────────

export const TIMEZONE_OPTIONS = [
  { value: 'auto',             label: 'Auto (System)'   },
  { value: 'UTC',              label: 'UTC'             },
  { value: 'America/New_York', label: 'Eastern (ET)'    },
  { value: 'America/Chicago',  label: 'Central (CT)'    },
  { value: 'Europe/London',    label: 'London (GMT)'    },
  { value: 'Asia/Singapore',   label: 'Singapore (SGT)' },
] as const

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English'  },
  { value: 'es', label: 'Español'  },
  { value: 'zh', label: '中文'      },
  { value: 'ja', label: '日本語'    },
] as const

export const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States'  },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada'         },
  { value: 'SG', label: 'Singapore'      },
  { value: 'AU', label: 'Australia'      },
  { value: 'DE', label: 'Germany'        },
] as const

// ─── Trading preferences ────────────────────────────────────────────────────

export interface TradingPrefs {
  defaultStake:         string
  confirmBeforeSubmit:  boolean
  defaultOutcome:       'yes' | 'no'
  slippage:             '0.5' | '1' | '2' | '5'
  oneClickTrading:      boolean
  showConsensusOnCards: boolean
  defaultMarketView:    'grid' | 'table'
}

export const DEFAULT_TRADING_PREFS: TradingPrefs = {
  defaultStake:         '100',
  confirmBeforeSubmit:  true,
  defaultOutcome:       'yes',
  slippage:             '1',
  oneClickTrading:      false,
  showConsensusOnCards: true,
  defaultMarketView:    'grid',
}

// ─── Wallet preferences ─────────────────────────────────────────────────────

export interface WalletPrefs {
  displayCurrency:    'USD' | 'EUR' | 'GBP' | 'BTC'
  gasPreference:      'standard' | 'fast' | 'instant'
  autoRefreshBalance: boolean
  hideSmallBalances:  boolean
  txNotifications:    boolean
}

export const DEFAULT_WALLET_PREFS: WalletPrefs = {
  displayCurrency:    'USD',
  gasPreference:      'standard',
  autoRefreshBalance: true,
  hideSmallBalances:  false,
  txNotifications:    true,
}

// ─── Accessibility preferences ──────────────────────────────────────────────

export interface AccessibilityPrefs {
  reduceMotion:      boolean
  highContrast:      boolean
  textSize:          'sm' | 'md' | 'lg'
  keyboardShortcuts: boolean
  underlineLinks:    boolean
}

export const DEFAULT_ACCESSIBILITY_PREFS: AccessibilityPrefs = {
  reduceMotion:      false,
  highContrast:      false,
  textSize:          'md',
  keyboardShortcuts: true,
  underlineLinks:    false,
}

// ─── Security preferences (UI only — no auth/KYC this sprint) ───────────────

export interface SecurityPrefs {
  twoFactor:              boolean
  loginAlerts:            boolean
  withdrawalConfirmation: boolean
  sessionTimeout:         '15' | '30' | '60' | 'never'
}

export const DEFAULT_SECURITY_PREFS: SecurityPrefs = {
  twoFactor:              false,
  loginAlerts:            true,
  withdrawalConfirmation: true,
  sessionTimeout:         '30',
}

// ─── App metadata ───────────────────────────────────────────────────────────

export const APP_META = {
  version:     '2.0.0',
  build:       '2026.06.26',
  channel:     'Beta',
  environment: 'Mock / Demo',
} as const
