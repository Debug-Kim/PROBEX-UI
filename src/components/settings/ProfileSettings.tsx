'use client'

import { useState } from 'react'
import { useCurrentUser } from '@/store/authStore'
import { COUNTRY_OPTIONS, TIMEZONE_OPTIONS } from '@/mock/settings'
import { SettingsSection, SettingRow, TextField, SelectField, SaveBar } from './controls'

export function ProfileSettings() {
  const user = useCurrentUser()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [country, setCountry]   = useState<string>(user?.country ?? 'US')
  const [timezone, setTimezone] = useState<string>('auto')
  const [headline, setHeadline] = useState('Consensus-driven trader')
  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2000) }

  const initials = (user?.displayName ?? 'U')
    .split(' ').map((w) => w.charAt(0)).slice(0, 2).join('').toUpperCase()

  return (
    <SettingsSection
      title="Profile"
      description="Manage how you appear across Probex."
      footer={<SaveBar onSave={save} saved={saved} />}
    >
      <SettingRow label="Profile photo" description="Shown on your account menu and activity feed.">
        <div className="flex items-center gap-3 justify-end">
          <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 44, height: 44, background: 'var(--probex-gradient-brand)', color: '#fff', fontWeight: 700, fontSize: 15 }} aria-hidden="true">
            {initials}
          </div>
          <button type="button" className="text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-100" style={{ border: '1px solid var(--probex-border-default)', color: 'var(--probex-text-secondary)' }}>
            Upload
          </button>
        </div>
      </SettingRow>

      <SettingRow label="Display name" htmlFor="pf-name" description="Your public-facing name.">
        <TextField id="pf-name" value={displayName} onChange={setDisplayName} />
      </SettingRow>

      <SettingRow label="Email address" htmlFor="pf-email" description="Managed via authentication (a later sprint).">
        <TextField id="pf-email" value={user?.email ?? ''} readOnly />
      </SettingRow>

      <SettingRow label="Headline" htmlFor="pf-headline" description="A short tagline for your profile.">
        <TextField id="pf-headline" value={headline} onChange={setHeadline} placeholder="Add a short headline" />
      </SettingRow>

      <SettingRow label="Country" htmlFor="pf-country">
        <SelectField id="pf-country" value={country} onChange={setCountry} options={COUNTRY_OPTIONS} />
      </SettingRow>

      <SettingRow label="Timezone" htmlFor="pf-tz" description="Used for charts, alerts, and resolution times." last>
        <SelectField id="pf-tz" value={timezone} onChange={setTimezone} options={TIMEZONE_OPTIONS} />
      </SettingRow>
    </SettingsSection>
  )
}
