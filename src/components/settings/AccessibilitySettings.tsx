'use client'

import { useState } from 'react'
import { DEFAULT_ACCESSIBILITY_PREFS, type AccessibilityPrefs } from '@/mock/settings'
import { SettingsSection, SettingRow, Toggle, SegmentedControl, SaveBar } from './controls'

const TEXT_SIZE_OPTIONS = [
  { value: 'sm', label: 'Small'  },
  { value: 'md', label: 'Default' },
  { value: 'lg', label: 'Large'  },
] as const

export function AccessibilitySettings() {
  const [p, setP] = useState<AccessibilityPrefs>(DEFAULT_ACCESSIBILITY_PREFS)
  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2000) }
  const set = <K extends keyof AccessibilityPrefs>(k: K, v: AccessibilityPrefs[K]) => setP((prev) => ({ ...prev, [k]: v }))

  return (
    <SettingsSection
      title="Accessibility"
      description="Adjust motion, contrast, and readability."
      footer={<SaveBar onSave={save} saved={saved} />}
    >
      <SettingRow label="Reduce motion" description="Minimize animations and transitions.">
        <Toggle checked={p.reduceMotion} onChange={(v) => set('reduceMotion', v)} label="Reduce motion" />
      </SettingRow>
      <SettingRow label="High contrast" description="Increase contrast for borders and text.">
        <Toggle checked={p.highContrast} onChange={(v) => set('highContrast', v)} label="High contrast" />
      </SettingRow>
      <SettingRow label="Text size" description="Scale interface text.">
        <SegmentedControl value={p.textSize} onChange={(v) => set('textSize', v)} options={TEXT_SIZE_OPTIONS} ariaLabel="Text size" />
      </SettingRow>
      <SettingRow label="Keyboard shortcuts" description="Enable global keyboard navigation shortcuts.">
        <Toggle checked={p.keyboardShortcuts} onChange={(v) => set('keyboardShortcuts', v)} label="Keyboard shortcuts" />
      </SettingRow>
      <SettingRow label="Underline links" description="Always underline links for clarity." last>
        <Toggle checked={p.underlineLinks} onChange={(v) => set('underlineLinks', v)} label="Underline links" />
      </SettingRow>
    </SettingsSection>
  )
}
