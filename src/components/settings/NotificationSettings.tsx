'use client'

import { useState } from 'react'
import { useCurrentUser } from '@/store/authStore'
import { SettingsSection, SettingRow, Toggle, SelectField, SaveBar } from './controls'
import type { UserPreferences } from '@/types/user'

const DIGEST_OPTIONS = [
  { value: 'daily',  label: 'Daily'  },
  { value: 'weekly', label: 'Weekly' },
  { value: 'never',  label: 'Never'  },
] as const

interface NotifState {
  master:        boolean
  priceAlerts:   boolean
  consensus:     boolean
  resolutions:   boolean
  push:          boolean
  email:         boolean
  research:      boolean
  digest:        UserPreferences['emailDigest']
}

export function NotificationSettings() {
  const user = useCurrentUser()
  const p = user?.preferences
  const [s, setS] = useState<NotifState>({
    master:      p?.notificationsEnabled ?? true,
    priceAlerts: p?.priceAlerts ?? true,
    consensus:   p?.consensusAlerts ?? false,
    resolutions: true,
    push:        true,
    email:       true,
    research:    false,
    digest:      p?.emailDigest ?? 'weekly',
  })
  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2000) }
  const set = <K extends keyof NotifState>(k: K, v: NotifState[K]) => setS((prev) => ({ ...prev, [k]: v }))

  return (
    <div className="flex flex-col gap-5">
      <SettingsSection
        title="Notifications"
        description="Control what Probex alerts you about."
        footer={<SaveBar onSave={save} saved={saved} />}
      >
        <SettingRow label="Enable notifications" description="Master switch for all alerts.">
          <Toggle checked={s.master} onChange={(v) => set('master', v)} label="Enable notifications" />
        </SettingRow>
        <SettingRow label="Price alerts" description="Notify when a watched market crosses a threshold.">
          <Toggle checked={s.priceAlerts} onChange={(v) => set('priceAlerts', v)} label="Price alerts" />
        </SettingRow>
        <SettingRow label="Consensus alerts" description="Notify on significant consensus-score shifts.">
          <Toggle checked={s.consensus} onChange={(v) => set('consensus', v)} label="Consensus alerts" />
        </SettingRow>
        <SettingRow label="Market resolutions" description="Notify when a market you hold resolves." last>
          <Toggle checked={s.resolutions} onChange={(v) => set('resolutions', v)} label="Market resolutions" />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Channels" description="How notifications reach you.">
        <SettingRow label="Push notifications" description="In-app and browser push.">
          <Toggle checked={s.push} onChange={(v) => set('push', v)} label="Push notifications" />
        </SettingRow>
        <SettingRow label="Email notifications" description="Important alerts via email.">
          <Toggle checked={s.email} onChange={(v) => set('email', v)} label="Email notifications" />
        </SettingRow>
        <SettingRow label="Email digest frequency" htmlFor="nt-digest" description="Summary of activity and signals.">
          <SelectField id="nt-digest" value={s.digest} onChange={(v) => set('digest', v)} options={DIGEST_OPTIONS} />
        </SettingRow>
        <SettingRow label="Weekly research digest" description="Curated consensus research and market intelligence." last>
          <Toggle checked={s.research} onChange={(v) => set('research', v)} label="Weekly research digest" />
        </SettingRow>
      </SettingsSection>
    </div>
  )
}
