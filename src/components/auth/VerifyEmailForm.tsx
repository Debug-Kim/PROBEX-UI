'use client'

import { useEffect, useRef, useState } from 'react'
import Link        from 'next/link'
import { useRouter } from 'next/navigation'
import { ROUTES }  from '@/config/constants'

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 30

/**
 * VerifyEmailForm
 *
 * 6-digit code entry with auto-advance, paste support, resend cooldown, and
 * success / error states. Code "000000" simulates an invalid code.
 */
export function VerifyEmailForm({ email }: { email?: string | undefined }) {
  const router = useRouter()
  const [digits, setDigits]       = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [error, setError]         = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified]   = useState(false)
  const [cooldown, setCooldown]   = useState(0)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const code = digits.join('')
  const isComplete = code.length === CODE_LENGTH

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const focusInput = (i: number) => inputsRef.current[i]?.focus()

  const setDigit = (i: number, value: string) => {
    setError(null)
    setDigits((prev) => {
      const next = [...prev]
      next[i] = value
      return next
    })
  }

  const handleChange = (i: number, raw: string) => {
    const value = raw.replace(/\D/g, '')
    if (!value) {
      setDigit(i, '')
      return
    }
    // Handle multi-char (autofill / fast typing) by spreading across fields
    if (value.length > 1) {
      handlePaste(i, value)
      return
    }
    setDigit(i, value)
    if (i < CODE_LENGTH - 1) focusInput(i + 1)
  }

  const handlePaste = (start: number, pasted: string) => {
    const chars = pasted.replace(/\D/g, '').slice(0, CODE_LENGTH - start).split('')
    setError(null)
    setDigits((prev) => {
      const next = [...prev]
      chars.forEach((ch, idx) => { next[start + idx] = ch })
      return next
    })
    const lastIndex = Math.min(start + chars.length, CODE_LENGTH - 1)
    focusInput(lastIndex)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      focusInput(i - 1)
    } else if (e.key === 'ArrowLeft' && i > 0) {
      focusInput(i - 1)
    } else if (e.key === 'ArrowRight' && i < CODE_LENGTH - 1) {
      focusInput(i + 1)
    }
  }

  const handleVerify = async () => {
    if (!isComplete) return
    setVerifying(true)
    setError(null)
    await new Promise((r) => setTimeout(r, 900))
    setVerifying(false)

    if (code === '000000') {
      setError('That code is incorrect or has expired. Please try again.')
      setDigits(Array(CODE_LENGTH).fill(''))
      focusInput(0)
      return
    }

    setVerified(true)
  }

  const handleResend = () => {
    if (cooldown > 0) return
    setCooldown(RESEND_COOLDOWN_SECONDS)
    setError(null)
 // authService.resendVerification(email)
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (verified) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-2">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'var(--probex-positive-dim)', border: '1px solid rgba(16,185,129,0.2)' }}
          aria-hidden="true"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--probex-positive)' }}>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--probex-text-primary)' }}>
            Email verified
          </p>
          <p className="text-sm" style={{ color: 'var(--probex-text-muted)' }}>
            Your email address is confirmed. Welcome to Probex.
          </p>
        </div>
        <button
          onClick={() => router.push(ROUTES.HOME)}
          className="btn-primary w-full h-10 flex items-center justify-center mt-1"
        >
          Go to dashboard
        </button>
      </div>
    )
  }

  // ── Code-entry state ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-center -mt-1" style={{ color: 'var(--probex-text-muted)' }}>
        We sent a 6-digit code to{' '}
        <span className="font-medium" style={{ color: 'var(--probex-text-secondary)' }}>
          {email ?? 'your email address'}
        </span>
        . Enter it below to verify your account.
      </p>

      {/* Code inputs */}
      <div className="flex justify-center gap-2" role="group" aria-label="Verification code">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => { e.preventDefault(); handlePaste(i, e.clipboardData.getData('text')) }}
            aria-label={`Digit ${i + 1}`}
            className="w-11 h-13 text-center text-xl font-bold rounded-md transition-colors duration-150 tabular-nums"
            style={{
              height:      '3.25rem',
              background:  'var(--probex-surface-2)',
              border:      `1px solid ${error ? 'var(--probex-negative)' : digit ? 'var(--probex-border-active)' : 'var(--probex-border-default)'}`,
              color:       'var(--probex-text-primary)',
            }}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-center font-medium -mt-2" style={{ color: 'var(--probex-negative)' }} role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleVerify}
        disabled={!isComplete || verifying}
        className="btn-primary w-full h-10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {verifying && (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {verifying ? 'Verifying…' : 'Verify Email'}
      </button>

      {/* Resend */}
      <p className="text-center text-xs" style={{ color: 'var(--probex-text-muted)' }}>
        Didn&apos;t receive a code?{' '}
        {cooldown > 0 ? (
          <span style={{ color: 'var(--probex-text-disabled)' }}>Resend in {cooldown}s</span>
        ) : (
          <button onClick={handleResend} className="font-semibold cursor-pointer" style={{ color: 'var(--probex-primary)' }}>
            Resend code
          </button>
        )}
      </p>

      <Link
        href={ROUTES.LOGIN}
        className="text-center text-xs font-semibold"
        style={{ color: 'var(--probex-text-secondary)' }}
      >
        ← Back to sign in
      </Link>
    </div>
  )
}
