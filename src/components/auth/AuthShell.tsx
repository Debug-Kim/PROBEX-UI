'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

interface AuthShellProps {
  children:    ReactNode
  title:       string
  subtitle?:   string
}

/**
 * AuthShell
 * ─────────
 * Full-screen auth page wrapper. Matches the landing page aesthetic:
 * deep dark background with subtle radial gradient and brand lockup.
 *
 * Layout:
 *   - Full viewport height, centered card
 *   - QUBO · Probex logo top-left (links home)
 *   - Radial gradient background (aurora theme)
 *   - Card fades in on mount
 */
export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--probex-bg)' }}
    >
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,0.08) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(109,94,247,0.06) 0%, transparent 50%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
          aria-label="Probex home"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: 'var(--probex-gradient-brand)', color: '#050816' }}
            aria-hidden="true"
          >
            ₿
          </div>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--probex-text-muted)' }}>
            QUBO
          </span>
          <span className="text-sm font-bold text-gradient-brand">Probex</span>
        </Link>

        <div
          className="text-2xs font-semibold px-2 py-1 rounded-full"
          style={{
            background: 'rgba(16,185,129,0.1)',
            color:      'var(--probex-positive)',
            border:     '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-live-pulse" aria-hidden="true" />
          Engine Live
        </div>
      </header>

      {/* Centered card area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--probex-text-primary)' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm" style={{ color: 'var(--probex-text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Card */}
          <div
            className="rounded-xl p-6 sm:p-8"
            style={{
              background: 'var(--probex-surface)',
              border:     '1px solid var(--probex-border-default)',
            }}
          >
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-xs" style={{ color: 'var(--probex-text-disabled)' }}>
          © 2026 QUBO Probex · Bitcoin Prediction Intelligence
        </p>
      </footer>
    </div>
  )
}

// ─── Shared form field component ──────────────────────────────────────────

interface FormFieldProps {
  label:        string
  htmlFor:      string
  error?:       string | undefined
  children:     ReactNode
  className?:   string | undefined
}

export function FormField({ label, htmlFor, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--probex-text-muted)' }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs font-medium" style={{ color: 'var(--probex-negative)' }} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Input component ──────────────────────────────────────────────────────

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export function AuthInput({ hasError, className, ...props }: AuthInputProps) {
  return (
    <input
      className={cn('input-base h-10 text-sm', className)}
      style={{
        borderColor: hasError ? 'var(--probex-negative)' : undefined,
      }}
      {...props}
    />
  )
}

// ─── Google OAuth button ──────────────────────────────────────────────────

interface GoogleButtonProps {
  onClick:    () => void
  isLoading?: boolean
  label:      string
}

export function GoogleButton({ onClick, isLoading, label }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center justify-center gap-2.5 w-full h-10 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        background: 'var(--probex-surface-2)',
        border:     '1px solid var(--probex-border-default)',
        color:      'var(--probex-text-primary)',
      }}
      onMouseEnter={(e) => {
        if (!isLoading) e.currentTarget.style.borderColor = 'var(--probex-border-strong)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--probex-border-default)'
      }}
    >
      {/* Google icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {isLoading ? 'Connecting…' : label}
    </button>
  )
}

// ─── Auth divider ─────────────────────────────────────────────────────────

export function AuthDivider() {
  return (
    <div className="relative flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: 'var(--probex-border)' }} />
      <span className="text-xs" style={{ color: 'var(--probex-text-disabled)' }}>or</span>
      <div className="flex-1 h-px" style={{ background: 'var(--probex-border)' }} />
    </div>
  )
}

// ─── Submit button ────────────────────────────────────────────────────────

interface AuthSubmitProps {
  isLoading:  boolean
  label:      string
  loadingLabel?: string
}

export function AuthSubmit({ isLoading, label, loadingLabel }: AuthSubmitProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="btn-primary w-full h-10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
    >
      {isLoading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      )}
      {isLoading ? (loadingLabel ?? 'Please wait…') : label}
    </button>
  )
}
