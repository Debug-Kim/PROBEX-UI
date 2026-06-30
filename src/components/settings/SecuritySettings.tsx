'use client'

import { useState } from 'react'
import { DEFAULT_SECURITY_PREFS } from '@/lib/settings/defaults'
import type { SecurityPrefs } from '@/types/settings'
import { SettingsSection, SettingRow, Toggle, SelectField, SaveBar } from './controls'

const TIMEOUT_OPTIONS = [
  { value: '15',    label: '15 minutes' },
  { value: '30',    label: '30 minutes' },
  { value: '60',    label: '1 hour'     },
  { value: 'never', label: 'Never'      },
] as const

export function SecuritySettings() {
  const [s, setS] = useState<SecurityPrefs>(DEFAULT_SECURITY_PREFS)
  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2000) }
  const set = <K extends keyof SecurityPrefs>(k: K, v: SecurityPrefs[K]) => setS((prev) => ({ ...prev, [k]: v }))

  return (
    <div className="flex flex-col gap-5">
      <SettingsSection
        title="Security"
        description="Protect your account and trading activity."
        footer={<SaveBar onSave={save} saved={saved} />}
      >
        <SettingRow label="Two-factor authentication" description="Require a second factor at sign-in.">
          <Toggle checked={s.twoFactor} onChange={(v) => set('twoFactor', v)} label="Two-factor authentication" />
        </SettingRow>
        <SettingRow label="Login alerts" description="Email me when a new device signs in.">
          <Toggle checked={s.loginAlerts} onChange={(v) => set('loginAlerts', v)} label="Login alerts" />
        </SettingRow>
        <SettingRow label="Confirm withdrawals" description="Require explicit confirmation before any withdrawal.">
          <Toggle checked={s.withdrawalConfirmation} onChange={(v) => set('withdrawalConfirmation', v)} label="Confirm withdrawals" />
        </SettingRow>
        <SettingRow label="Auto sign-out" htmlFor="sec-timeout" description="Sign out after a period of inactivity." last>
          <SelectField id="sec-timeout" value={s.sessionTimeout} onChange={(v) => set('sessionTimeout', v)} options={TIMEOUT_OPTIONS} />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Credentials" description="Password and recovery are managed by authentication.">
        <SettingRow label="Password" description="Set up in the authentication sprint." last>
          <button type="button" disabled className="text-xs px-3 py-1.5 rounded-md" style={{ border: '1px solid var(--probex-border)', color: 'var(--probex-text-disabled)', cursor: 'not-allowed' }}>
            Change password
          </button>
        </SettingRow>
      </SettingsSection>
    </div>
  )
}
