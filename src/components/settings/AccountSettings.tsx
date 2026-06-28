'use client'

import { useState } from 'react'
import { cn, formatDate } from '@/lib/utils'
import { useCurrentUser } from '@/store/authStore'
import { LANGUAGE_OPTIONS } from '@/mock/settings'
import { SettingsSection, SettingRow, SelectField, SegmentedControl, SaveBar, ReadOnlyValue } from './controls'
import type { UserPreferences } from '@/types/user'

const VIEW_OPTIONS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'markets',   label: 'Markets'   },
  { value: 'portfolio', label: 'Portfolio' },
] as const

const ROLE_LABEL: Record<string, string> = {
  retail:       'Retail',
  professional: 'Professional',
  admin:        'Administrator',
}

export function AccountSettings() {
  const user = useCurrentUser()
  const [language, setLanguage]   = useState<string>('en')
  const [defaultView, setDefaultView] = useState<UserPreferences['defaultView']>(user?.preferences.defaultView ?? 'dashboard')
  const [saved, setSaved] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const save = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="flex flex-col gap-5">
      <SettingsSection
        title="Account"
        description="Account identity, plan, and platform defaults."
        footer={<SaveBar onSave={save} saved={saved} />}
      >
        <SettingRow label="Account type" description="Your current access tier.">
          <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--probex-primary-dim)', color: 'var(--probex-primary)' }}>
            {ROLE_LABEL[user?.role ?? 'retail'] ?? user?.role}
          </span>
        </SettingRow>

        <SettingRow label="Account ID" description="Reference this when contacting support.">
          <ReadOnlyValue mono>{user?.id ?? '—'}</ReadOnlyValue>
        </SettingRow>

        <SettingRow label="Member since">
          <ReadOnlyValue>{user ? formatDate(user.createdAt) : '—'}</ReadOnlyValue>
        </SettingRow>

        <SettingRow label="Email status">
          <span className="text-xs font-medium" style={{ color: user?.isEmailVerified ? 'var(--probex-positive)' : 'var(--probex-warning)' }}>
            {user?.isEmailVerified ? '✓ Verified' : 'Unverified'}
          </span>
        </SettingRow>

        <SettingRow label="Language" htmlFor="ac-lang">
          <SelectField id="ac-lang" value={language} onChange={setLanguage} options={LANGUAGE_OPTIONS} />
        </SettingRow>

        <SettingRow label="Default landing view" description="Where Probex opens after sign-in." last>
          <SegmentedControl value={defaultView} onChange={setDefaultView} options={VIEW_OPTIONS} ariaLabel="Default landing view" />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Data & Privacy" description="Export your data or close your account.">
        <SettingRow label="Export account data" description="Download a copy of your profile, positions, and activity (JSON).">
          <button type="button" className="text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-100" style={{ border: '1px solid var(--probex-border-default)', color: 'var(--probex-text-secondary)' }}>
            Request export
          </button>
        </SettingRow>

        <SettingRow label="Close account" description="Permanently disable this account. This cannot be undone." last>
          {confirmClose ? (
            <div className="flex items-center gap-2 justify-end">
              <span className="text-2xs" style={{ color: 'var(--probex-text-muted)' }}>Are you sure?</span>
              <button type="button" onClick={() => setConfirmClose(false)} className="text-xs px-2.5 py-1.5 rounded-md cursor-pointer" style={{ border: '1px solid var(--probex-border)', color: 'var(--probex-text-secondary)' }}>Cancel</button>
              <button type="button" onClick={() => setConfirmClose(false)} className={cn('text-xs px-2.5 py-1.5 rounded-md cursor-pointer font-semibold')} style={{ background: 'var(--probex-negative)', color: '#fff' }}>Confirm</button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmClose(true)} className="text-xs px-3 py-1.5 rounded-md cursor-pointer font-medium transition-colors duration-100" style={{ border: '1px solid var(--probex-negative)', color: 'var(--probex-negative)' }}>
              Close account
            </button>
          )}
        </SettingRow>
      </SettingsSection>
    </div>
  )
}
