'use client'

// Account-management platform shell: a grouped, keyboard-accessible section
// nav (vertical on desktop, horizontally scrollable on mobile) beside the
// active section panel. Section is deep-linkable via the URL hash.
//
// Sections compose the reusable settings controls; Appearance reuses the
// existing AppearanceSettings (theme architecture preserved).

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ProfileSettings }       from './ProfileSettings'
import { AccountSettings }       from './AccountSettings'
import { AppearanceSettings }    from './AppearanceSettings'
import { NotificationSettings }  from './NotificationSettings'
import { SecuritySettings }      from './SecuritySettings'
import { TradingSettings }       from './TradingSettings'
import { WalletSettings }        from './WalletSettings'
import { AccessibilitySettings } from './AccessibilitySettings'
import { SessionsSettings }      from './SessionsSettings'
import { AboutSettings }         from './AboutSettings'
import { Card } from '@/components/ui/Card'

type SectionId =
  | 'profile' | 'account' | 'appearance' | 'notifications' | 'security'
  | 'trading' | 'wallet' | 'accessibility' | 'sessions' | 'about'

const GROUPS: Array<{ label: string; items: Array<{ id: SectionId; label: string }> }> = [
  { label: 'Account', items: [
    { id: 'profile',  label: 'Profile' },
    { id: 'account',  label: 'Account' },
    { id: 'security', label: 'Security' },
    { id: 'sessions', label: 'Sessions & Devices' },
  ] },
  { label: 'Preferences', items: [
    { id: 'appearance',    label: 'Appearance' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'trading',       label: 'Trading' },
    { id: 'wallet',        label: 'Wallet' },
    { id: 'accessibility', label: 'Accessibility' },
  ] },
  { label: 'System', items: [
    { id: 'about', label: 'About' },
  ] },
]

const ALL_IDS: SectionId[] = GROUPS.flatMap((g) => g.items.map((i) => i.id))

function renderSection(id: SectionId) {
  switch (id) {
    case 'profile':       return <ProfileSettings />
    case 'account':       return <AccountSettings />
    case 'appearance':    return <Card><AppearanceSettings /></Card>
    case 'notifications': return <NotificationSettings />
    case 'security':      return <SecuritySettings />
    case 'trading':       return <TradingSettings />
    case 'wallet':        return <WalletSettings />
    case 'accessibility': return <AccessibilitySettings />
    case 'sessions':      return <SessionsSettings />
    case 'about':         return <AboutSettings />
  }
}

export function SettingsView() {
  const [active, setActive] = useState<SectionId>('profile')

  // Deep-link: hydrate from hash on mount, keep hash in sync on change.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as SectionId
    if (ALL_IDS.includes(hash)) setActive(hash)
  }, [])

  const select = (id: SectionId) => {
    setActive(id)
    if (typeof window !== 'undefined') window.history.replaceState(null, '', `#${id}`)
  }

  return (
    <div className="page-container">
      <header className="mb-6">
        <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--probex-text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--probex-text-muted)' }}>
          Manage your profile, preferences, security, and platform configuration.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-start">
        {/* Nav */}
        <nav
          aria-label="Settings sections"
          className="flex md:flex-col gap-1 w-full md:w-[208px] md:flex-shrink-0 overflow-x-auto md:overflow-visible no-scrollbar md:sticky md:top-4 pb-1 md:pb-0"
        >
          {GROUPS.map((group) => (
            <div key={group.label} className="flex md:flex-col gap-1 md:mb-2">
              <span className="hidden md:block text-2xs font-bold uppercase tracking-wider px-3 mt-2 mb-0.5" style={{ color: 'var(--probex-text-disabled)' }}>
                {group.label}
              </span>
              {group.items.map((item) => {
                const isActive = active === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => select(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex-shrink-0 text-xs font-medium text-left px-3 py-2 rounded-md cursor-pointer transition-colors duration-100 whitespace-nowrap',
                    )}
                    style={{
                      background: isActive ? 'var(--probex-primary-dim)' : 'transparent',
                      color:      isActive ? 'var(--probex-primary)' : 'var(--probex-text-secondary)',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--probex-surface-2)' }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Active section */}
        <section className="flex-1 min-w-0 w-full" aria-live="polite">
          {renderSection(active)}
        </section>
      </div>
    </div>
  )
}
