'use client'

import { useState } from 'react'
import { DEFAULT_TRADING_PREFS } from '@/lib/settings/defaults'
import type { TradingPrefs } from '@/types/settings'
import { SettingsSection, SettingRow, Toggle, TextField, SelectField, SegmentedControl, SaveBar } from './controls'

const OUTCOME_OPTIONS = [
  { value: 'yes', label: 'YES' },
  { value: 'no',  label: 'NO'  },
] as const

const SLIPPAGE_OPTIONS = [
  { value: '0.5', label: '0.5%' },
  { value: '1',   label: '1%'   },
  { value: '2',   label: '2%'   },
  { value: '5',   label: '5%'   },
] as const

const MARKET_VIEW_OPTIONS = [
  { value: 'grid',  label: 'Grid'  },
  { value: 'table', label: 'Table' },
] as const

export function TradingSettings() {
  const [p, setP] = useState<TradingPrefs>(DEFAULT_TRADING_PREFS)
  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2000) }
  const set = <K extends keyof TradingPrefs>(k: K, v: TradingPrefs[K]) => setP((prev) => ({ ...prev, [k]: v }))

  return (
    <SettingsSection
      title="Trading Preferences"
      description="Defaults applied to the trading drawer and order flow."
      footer={<SaveBar onSave={save} saved={saved} />}
    >
      <SettingRow label="Default stake" htmlFor="tr-stake" description="Pre-filled amount when opening a trade ($).">
        <TextField id="tr-stake" type="number" value={p.defaultStake} onChange={(v) => set('defaultStake', v)} />
      </SettingRow>
      <SettingRow label="Default outcome" description="Pre-selected side in the outcome selector.">
        <SegmentedControl value={p.defaultOutcome} onChange={(v) => set('defaultOutcome', v)} options={OUTCOME_OPTIONS} ariaLabel="Default outcome" />
      </SettingRow>
      <SettingRow label="Slippage tolerance" htmlFor="tr-slip" description="Maximum acceptable price movement.">
        <SelectField id="tr-slip" value={p.slippage} onChange={(v) => set('slippage', v)} options={SLIPPAGE_OPTIONS} />
      </SettingRow>
      <SettingRow label="Confirm before submit" description="Show a confirmation step before placing orders.">
        <Toggle checked={p.confirmBeforeSubmit} onChange={(v) => set('confirmBeforeSubmit', v)} label="Confirm before submit" />
      </SettingRow>
      <SettingRow label="One-click trading" description="Skip confirmation for faster execution (advanced).">
        <Toggle checked={p.oneClickTrading} onChange={(v) => set('oneClickTrading', v)} label="One-click trading" />
      </SettingRow>
      <SettingRow label="Show consensus on cards" description="Display the consensus badge on market cards.">
        <Toggle checked={p.showConsensusOnCards} onChange={(v) => set('showConsensusOnCards', v)} label="Show consensus on cards" />
      </SettingRow>
      <SettingRow label="Default market view" description="Layout used on the Markets page." last>
        <SegmentedControl value={p.defaultMarketView} onChange={(v) => set('defaultMarketView', v)} options={MARKET_VIEW_OPTIONS} ariaLabel="Default market view" />
      </SettingRow>
    </SettingsSection>
  )
}
