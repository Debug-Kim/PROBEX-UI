import type { WalletPrefs, TradingPrefs, AccessibilityPrefs, SecurityPrefs } from '@/types/settings'

export const DEFAULT_TRADING_PREFS: TradingPrefs = {
  defaultStake:         '100',
  confirmBeforeSubmit:  true,
  defaultOutcome:       'yes',
  slippage:             '1',
  oneClickTrading:      false,
  showConsensusOnCards: true,
  defaultMarketView:    'grid',
}

export const DEFAULT_WALLET_PREFS: WalletPrefs = {
  displayCurrency:    'USD',
  gasPreference:      'standard',
  autoRefreshBalance: true,
  hideSmallBalances:  false,
  txNotifications:    true,
}

export const DEFAULT_ACCESSIBILITY_PREFS: AccessibilityPrefs = {
  reduceMotion:      false,
  highContrast:      false,
  textSize:          'md',
  keyboardShortcuts: true,
  underlineLinks:    false,
}

export const DEFAULT_SECURITY_PREFS: SecurityPrefs = {
  twoFactor:              false,
  loginAlerts:            true,
  withdrawalConfirmation: true,
  sessionTimeout:         '30',
}
