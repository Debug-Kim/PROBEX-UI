'use client'

import { useState } from 'react'
import Link          from 'next/link'
import { useRouter }  from 'next/navigation'
import { useForm }   from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupFormData } from '@/lib/validation/auth'
import { ROUTES } from '@/config/constants'
import {
  FormField,
  AuthInput,
  GoogleButton,
  AuthDivider,
  AuthSubmit,
} from './AuthShell'

export function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword]     = useState(false)
  const [serverError, setServerError]       = useState<string | null>(null)
  const [googleLoading, setGoogleLoading]   = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null)
    await new Promise((r) => setTimeout(r, 1000))
    // New accounts must verify their email before reaching the dashboard.
    router.push(`${ROUTES.VERIFY}?email=${encodeURIComponent(data.email)}`)
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setGoogleLoading(false)
    router.push(ROUTES.HOME)
  }

  return (
    <div>
      <GoogleButton
        onClick={handleGoogleSignup}
        isLoading={googleLoading}
        label="Sign up with Google"
      />

      <AuthDivider />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm"
            style={{ background: 'var(--probex-negative-dim)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--probex-negative)' }}
            role="alert"
          >
            {serverError}
          </div>
        )}

        <FormField label="Full Name" htmlFor="signup-name" error={errors.displayName?.message}>
          <AuthInput
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Alex Reeves"
            hasError={!!errors.displayName}
            {...register('displayName')}
          />
        </FormField>

        <FormField label="Email" htmlFor="signup-email" error={errors.email?.message}>
          <AuthInput
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            hasError={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField label="Password" htmlFor="signup-password" error={errors.password?.message}>
          <div className="relative">
            <AuthInput
              id="signup-password"
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
                  ? <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><line x1="2" y1="2" x2="22" y2="22"/></>
                  : <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>
                }
              </svg>
            </button>
          </div>

          {/* Password strength hints */}
          <PasswordStrengthHints password={watch('password') ?? ''} />
        </FormField>

        <FormField label="Confirm Password" htmlFor="signup-confirm" error={errors.confirmPassword?.message}>
          <AuthInput
            id="signup-confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repeat password"
            hasError={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </FormField>

        {/* Terms */}
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded cursor-pointer flex-shrink-0"
              style={{ accentColor: 'var(--probex-primary)' }}
              {...register('acceptTerms')}
            />
            <span className="text-xs leading-relaxed" style={{ color: 'var(--probex-text-secondary)' }}>
              I agree to the{' '}
              <span className="font-semibold" style={{ color: 'var(--probex-primary)' }}>Terms of Service</span>
              {' '}and{' '}
              <span className="font-semibold" style={{ color: 'var(--probex-primary)' }}>Privacy Policy</span>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs" style={{ color: 'var(--probex-negative)' }} role="alert">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <AuthSubmit
          isLoading={isSubmitting}
          label="Create Account"
          loadingLabel="Creating account…"
        />
      </form>

      <p className="text-center text-xs mt-5" style={{ color: 'var(--probex-text-muted)' }}>
        Already have an account?{' '}
        <Link href={ROUTES.LOGIN} className="font-semibold" style={{ color: 'var(--probex-primary)' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}

// ─── Password strength hints ──────────────────────────────────────────────

function PasswordStrengthHints({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters',   pass: password.length >= 8 },
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
            {c.pass ? <path d="M20 6 9 17l-5-5"/> : <path d="M18 6 6 18M6 6l12 12"/>}
          </svg>
          {c.label}
        </span>
      ))}
    </div>
  )
}
