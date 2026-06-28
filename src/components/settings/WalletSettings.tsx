'use client'

import { useState } from 'react'
import { DEFAULT_WALLET_PREFS, type WalletPrefs } from '@/mock/settings'
import { SettingsSection, SettingRow, Toggle, SelectField, SaveBar, ReadOnlyValue } from './controls'

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'BTC', label: 'BTC (₿)' },
] as const

const GAS_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'fast',     label: 'Fast'     },
  { value: 'instant',  label: 'Instant'  },
] as const

export function WalletSettings() {
  const [p, setP] = useState<WalletPrefs>(DEFAULT_WALLET_PREFS)
  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2000) }
  const set = <K extends keyof WalletPrefs>(k: K, v: WalletPrefs[K]) => setP((prev) => ({ ...prev, [k]: v }))

  return (
    <SettingsSection
      title="Wallet Preferences"
      description="Display and funding defaults. On-chain wallet connection arrives in a later sprint."
      footer={<SaveBar onSave={save} saved={saved} />}
    >
      <SettingRow label="Display currency" htmlFor="wl-cur" description="Currency used for balances and P&L.">
        <SelectField id="wl-cur" value={p.displayCurrency} onChange={(v) => set('displayCurrency', v)} options={CURRENCY_OPTIONS} />
      </SettingRow>
      <SettingRow label="Network" description="Settlement network for trading.">
        <ReadOnlyValue>Polygon (Mainnet)</ReadOnlyValue>
      </SettingRow>
      <SettingRow label="Gas preference" htmlFor="wl-gas" description="Speed vs cost for on-chain transactions.">
        <SelectField id="wl-gas" value={p.gasPreference} onChange={(v) => set('gasPreference', v)} options={GAS_OPTIONS} />
      </SettingRow>
      <SettingRow label="Auto-refresh balance" description="Poll for balance updates while the wallet is open.">
        <Toggle checked={p.autoRefreshBalance} onChange={(v) => set('autoRefreshBalance', v)} label="Auto-refresh balance" />
      </SettingRow>
      <SettingRow label="Hide small balances" description="Hide positions and balances under $1.">
        <Toggle checked={p.hideSmallBalances} onChange={(v) => set('hideSmallBalances', v)} label="Hide small balances" />
      </SettingRow>
      <SettingRow label="Transaction notifications" description="Notify on deposits, withdrawals, and settlements." last>
        <Toggle checked={p.txNotifications} onChange={(v) => set('txNotifications', v)} label="Transaction notifications" />
      </SettingRow>
    </SettingsSection>
  )
}
