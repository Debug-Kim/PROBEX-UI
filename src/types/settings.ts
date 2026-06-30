export interface DeviceSession {
  id:         string
  device:     string
  browser:    string
  location:   string
  ipMasked:   string
  lastActive: string
  current:    boolean
}

export interface WalletPrefs {
  displayCurrency:    'USD' | 'EUR' | 'GBP' | 'BTC'
  gasPreference:      'standard' | 'fast' | 'instant'
  autoRefreshBalance: boolean
  hideSmallBalances:  boolean
  txNotifications:    boolean
}

export interface TradingPrefs {
  defaultStake:         string
  confirmBeforeSubmit:  boolean
  defaultOutcome:       'yes' | 'no'
  slippage:             '0.5' | '1' | '2' | '5'
  oneClickTrading:      boolean
  showConsensusOnCards: boolean
  defaultMarketView:    'grid' | 'table'
}

export interface AccessibilityPrefs {
  reduceMotion:      boolean
  highContrast:      boolean
  textSize:          'sm' | 'md' | 'lg'
  keyboardShortcuts: boolean
  underlineLinks:    boolean
}

export interface SecurityPrefs {
  twoFactor:              boolean
  loginAlerts:            boolean
  withdrawalConfirmation: boolean
  sessionTimeout:         '15' | '30' | '60' | 'never'
}
