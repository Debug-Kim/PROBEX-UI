'use client'

import { useState } from 'react'
import Link         from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm }  from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validation/auth'
import { ROUTES } from '@/config/constants'
import {
  FormField,
  AuthInput,
  GoogleButton,
  AuthDivider,
  AuthSubmit,
} from './AuthShell'

/**
 * LoginForm
 * ─────────
 * Full UI with React Hook Form + Zod validation.
 * Mock handlers only — no backend calls.
 * Connect to authService.login and authService.loginWithGoogle.
 */
export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError]   = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

 // Mock login handler — replace with authService.login
  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 900))

    // Mock: wrong password simulation
    if (data.password === 'wrongpassword') {
      setServerError('Invalid email or password. Please try again.')
      return
    }

    // Success → redirect to dashboard
    router.push(ROUTES.HOME)
  }

  // Mock Google login handler
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setGoogleLoading(false)
    router.push(ROUTES.HOME)
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Google OAuth */}
      <GoogleButton
        onClick={handleGoogleLogin}
        isLoading={googleLoading}
        label="Continue with Google"
      />

      <AuthDivider />

      {/* Email / Password form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

        {/* Server error */}
        {serverError && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm"
            style={{
              background: 'var(--probex-negative-dim)',
              border:     '1px solid rgba(239,68,68,0.2)',
              color:      'var(--probex-negative)',
            }}
            role="alert"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {serverError}
          </div>
        )}

        <FormField label="Email" htmlFor="login-email" error={errors.email?.message}>
          <AuthInput
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            hasError={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField label="Password" htmlFor="login-password" error={errors.password?.message}>
          <div className="relative">
            <AuthInput
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
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
              {showPassword ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </FormField>

        <div className="flex justify-end -mt-1">
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-xs transition-opacity duration-150 hover:opacity-100"
            style={{ color: 'var(--probex-primary)', opacity: 0.8 }}
          >
            Forgot password?
          </Link>
        </div>

        <AuthSubmit
          isLoading={isSubmitting}
          label="Sign In"
          loadingLabel="Signing in…"
        />
      </form>

      {/* Sign up link */}
      <p className="text-center text-xs mt-5" style={{ color: 'var(--probex-text-muted)' }}>
        Don&apos;t have an account?{' '}
        <Link
          href={ROUTES.SIGNUP}
          className="font-semibold transition-colors duration-150"
          style={{ color: 'var(--probex-primary)' }}
        >
          Create account
        </Link>
      </p>
    </div>
  )
}
