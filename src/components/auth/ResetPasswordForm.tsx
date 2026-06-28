'use client'

import { useState }    from 'react'
import Link             from 'next/link'
import { useRouter }    from 'next/navigation'
import { useForm }      from 'react-hook-form'
import { zodResolver }  from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validation/auth'
import { ROUTES }       from '@/config/constants'
import { FormField, AuthInput, AuthSubmit } from './AuthShell'

/**
 * ResetPasswordForm
 *
 * Reached from the emailed reset link (`?token=`). A token value of
 * "expired" simulates an invalid/expired link.
 */
export function ResetPasswordForm({ token }: { token?: string | undefined }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError]   = useState<string | null>(null)
  const [done, setDone]                 = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async (_data: ResetPasswordFormData) => {
    setServerError(null)
    await new Promise((r) => setTimeout(r, 900))

    // Mock: expired/invalid token simulation
    if (token === 'expired') {
      setServerError('This reset link has expired. Please request a new one.')
      return
    }

    setDone(true)
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (done) {
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
            Password updated
          </p>
          <p className="text-sm" style={{ color: 'var(--probex-text-muted)' }}>
            Your password has been reset. You can now sign in with your new credentials.
          </p>
        </div>
        <Link href={ROUTES.LOGIN} className="btn-primary w-full h-10 flex items-center justify-center mt-1 no-underline">
          Continue to sign in
        </Link>
      </div>
    )
  }

  // ── Form state ──────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-center -mt-1 mb-1" style={{ color: 'var(--probex-text-muted)' }}>
        Choose a new password for your account.
      </p>

      {serverError && (
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm"
          style={{ background: 'var(--probex-negative-dim)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--probex-negative)' }}
          role="alert"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {serverError}
        </div>
      )}

      <FormField label="New Password" htmlFor="reset-password" error={errors.password?.message}>
        <div className="relative">
          <AuthInput
            id="reset-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            hasError={!!errors.password}
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: 'var(--probex-text-muted)' }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {showPassword
                ? <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><line x1="2" y1="2" x2="22" y2="22" /></>
                : <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>
              }
            </svg>
          </button>
        </div>
        <PasswordStrengthHints password={watch('password') ?? ''} />
      </FormField>

      <FormField label="Confirm Password" htmlFor="reset-confirm" error={errors.confirmPassword?.message}>
        <AuthInput
          id="reset-confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repeat new password"
          hasError={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
      </FormField>

      <AuthSubmit isLoading={isSubmitting} label="Reset Password" loadingLabel="Updating…" />

      <button
        type="button"
        onClick={() => router.push(ROUTES.LOGIN)}
        className="text-center text-xs font-semibold mt-1 cursor-pointer"
        style={{ color: 'var(--probex-text-muted)' }}
      >
        ← Back to sign in
      </button>
    </form>
  )
}

// ─── Password strength hints (shared shape with SignupForm) ─────────────────

function PasswordStrengthHints({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters',    pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number',           pass: /[0-9]/.test(password) },
  ]

  if (!password) return null

  return (
    <div className="flex gap-3 mt-1">
      {checks.map((c) => (
        <span
          key={c.label}
          className="flex items-center gap-1 text-xs"
          style={{ color: c.pass ? 'var(--probex-positive)' : 'var(--probex-text-disabled)' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            {c.pass ? <path d="M20 6 9 17l-5-5" /> : <path d="M18 6 6 18M6 6l12 12" />}
          </svg>
          {c.label}
        </span>
      ))}
    </div>
  )
}
