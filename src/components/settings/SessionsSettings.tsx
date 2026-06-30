'use client'

import { useState } from 'react'
import { useSessions } from '@/hooks/useServices'
import { SettingsSection, SettingRow } from './controls'

export function SessionsSettings() {
  const allSessions = useSessions().data ?? []
  const [revoked, setRevoked] = useState<ReadonlySet<string>>(() => new Set())

  const sessions   = allSessions.filter((s) => s.current || !revoked.has(s.id))
  const revoke     = (id: string) => setRevoked((prev) => new Set([...prev, id]))
  const signOutOthers = () => setRevoked((prev) => new Set([...prev, ...allSessions.filter((s) => !s.current).map((s) => s.id)]))
  const otherCount = sessions.filter((s) => !s.current).length

  return (
    <SettingsSection
      title="Sessions & Devices"
      description="Devices currently signed in to your account."
      footer={otherCount > 0 ? (
        <button
          type="button"
          onClick={signOutOthers}
          className="text-xs px-3 py-1.5 rounded-md cursor-pointer font-medium transition-colors duration-100"
          style={{ border: '1px solid var(--probex-negative)', color: 'var(--probex-negative)' }}
        >
          Sign out all other sessions
        </button>
      ) : null}
    >
      {sessions.map((s, i) => (
        <SettingRow
          key={s.id}
          label={s.device}
          description={`${s.browser} · ${s.location} · ${s.ipMasked} · ${s.lastActive}`}
          last={i === sessions.length - 1}
        >
          {s.current ? (
            <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'color-mix(in srgb, var(--probex-positive) 14%, transparent)', color: 'var(--probex-positive)' }}>
              This device
            </span>
          ) : (
            <button
              type="button"
              onClick={() => revoke(s.id)}
              className="text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-100"
              style={{ border: '1px solid var(--probex-border-default)', color: 'var(--probex-text-secondary)' }}
            >
              Revoke
            </button>
          )}
        </SettingRow>
      ))}
    </SettingsSection>
  )
}
