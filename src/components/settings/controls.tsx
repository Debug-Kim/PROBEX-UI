'use client'

/**
 * Settings control primitives
 * ───────────────────────────
 * Reusable, keyboard-accessible building blocks for the Settings platform.
 * Styled exclusively with existing design tokens (var(--probex-*)) and the
 * shared Card component, so every section stays visually consistent.
 */

import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

// ─── Section card ───────────────────────────────────────────────────────────

export function SettingsSection({
  title, description, children, footer,
}: {
  title:       string
  description?: string
  children:    ReactNode
  footer?:     ReactNode
}) {
  return (
    <Card noPadding className="overflow-hidden">
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--probex-border)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--probex-text-primary)' }}>{title}</h2>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--probex-text-muted)' }}>{description}</p>}
      </div>
      <div className="flex flex-col">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-3" style={{ padding: '12px 18px', borderTop: '1px solid var(--probex-border)' }}>
          {footer}
        </div>
      )}
    </Card>
  )
}

// ─── Setting row (label + control) ──────────────────────────────────────────

export function SettingRow({
  label, htmlFor, description, children, last,
}: {
  label:       string
  htmlFor?:    string
  description?: string
  children:    ReactNode
  last?:       boolean
}) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-[18px] py-3.5"
      style={last ? undefined : { borderBottom: '1px solid var(--probex-border)' }}
    >
      <div className="flex-1 min-w-0">
        <label htmlFor={htmlFor} className="text-xs font-medium block" style={{ color: 'var(--probex-text-primary)' }}>{label}</label>
        {description && <p className="text-2xs mt-0.5 leading-relaxed" style={{ color: 'var(--probex-text-muted)' }}>{description}</p>}
      </div>
      <div className="flex-shrink-0 w-full sm:w-auto sm:min-w-[200px] sm:flex sm:justify-end">{children}</div>
    </div>
  )
}

// ─── Toggle switch ──────────────────────────────────────────────────────────

export function Toggle({
  checked, onChange, id, label,
}: {
  checked:  boolean
  onChange: (v: boolean) => void
  id?:      string
  label?:   string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center rounded-full transition-colors duration-150 cursor-pointer flex-shrink-0"
      style={{ width: 38, height: 22, background: checked ? 'var(--probex-primary)' : 'var(--probex-border-default)' }}
    >
      <span
        className="rounded-full"
        style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 18, height: 18, background: '#fff', transition: 'left 0.15s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
      />
    </button>
  )
}

// ─── Text field ─────────────────────────────────────────────────────────────

export function TextField({
  id, value, onChange, placeholder, type = 'text', readOnly, disabled,
}: {
  id?:          string
  value:        string
  onChange?:    (v: string) => void
  placeholder?: string
  type?:        string
  readOnly?:    boolean
  disabled?:    boolean
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      className="input-base text-sm"
      style={readOnly || disabled ? { opacity: 0.65, cursor: 'not-allowed' } : undefined}
    />
  )
}

// ─── Select field ───────────────────────────────────────────────────────────

export function SelectField<T extends string>({
  id, value, onChange, options,
}: {
  id?:      string
  value:    T
  onChange: (v: T) => void
  options:  ReadonlyArray<{ value: T; label: string }>
}) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="input-base text-sm appearance-none pr-8 cursor-pointer"
        style={{ minWidth: 160 }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
        style={{ color: 'var(--probex-text-muted)' }}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

// ─── Segmented control (radio group) ────────────────────────────────────────

export function SegmentedControl<T extends string>({
  value, onChange, options, ariaLabel,
}: {
  value:     T
  onChange:  (v: T) => void
  options:   ReadonlyArray<{ value: T; label: string }>
  ariaLabel?: string
}) {
  return (
    <div className="flex rounded-md overflow-hidden w-full sm:w-auto" style={{ border: '1px solid var(--probex-border-default)' }} role="radiogroup" aria-label={ariaLabel}>
      {options.map((o, i) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className="flex-1 sm:flex-none text-xs font-medium px-3 py-1.5 cursor-pointer transition-colors duration-100 whitespace-nowrap"
            style={{
              background:  active ? 'var(--probex-primary-dim)' : 'transparent',
              color:       active ? 'var(--probex-primary)' : 'var(--probex-text-muted)',
              borderRight: i < options.length - 1 ? '1px solid var(--probex-border-default)' : 'none',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Save bar ───────────────────────────────────────────────────────────────

export function SaveBar({ onSave, saved, onReset }: { onSave: () => void; saved: boolean; onReset?: () => void }) {
  return (
    <>
      {saved && <span className="text-2xs font-semibold" style={{ color: 'var(--probex-positive)' }} role="status">✓ Saved locally</span>}
      {onReset && (
        <button onClick={onReset} className="text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-100" style={{ color: 'var(--probex-text-muted)', border: '1px solid var(--probex-border)' }}>
          Reset
        </button>
      )}
      <button onClick={onSave} className="btn-primary text-xs">Save changes</button>
    </>
  )
}

// ─── Read-only value row ────────────────────────────────────────────────────

export function ReadOnlyValue({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return (
    <span className={mono ? 'text-xs font-mono' : 'text-xs font-medium'} style={{ color: 'var(--probex-text-secondary)' }}>
      {children}
    </span>
  )
}
