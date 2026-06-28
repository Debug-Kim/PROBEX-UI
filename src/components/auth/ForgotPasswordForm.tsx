'use client'

import { useState }    from 'react'
import Link             from 'next/link'
import { useForm }     from 'react-hook-form'
import { zodResolver }  from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validation/auth'
import { ROUTES }      from '@/config/constants'
import { FormField, AuthInput, AuthSubmit } from './AuthShell'

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail]         = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await new Promise((r) => setTimeout(r, 900))
    setEmail(data.email)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-2">
        {/* Success icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'var(--probex-positive-dim)', border: '1px solid rgba(16,185,129,0.2)' }}
          aria-hidden="true"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--probex-positive)' }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--probex-text-primary)' }}>
            Check your inbox
          </p>
          <p className="text-sm" style={{ color: 'var(--probex-text-muted)' }}>
            We sent a password reset link to{' '}
            <span className="font-medium" style={{ color: 'var(--probex-text-secondary)' }}>
              {email}
            </span>
          </p>
        </div>
        <p className="text-xs" style={{ color: 'var(--probex-text-disabled)' }}>
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button
            onClick={() => setSubmitted(false)}
            className="font-semibold cursor-pointer"
            style={{ color: 'var(--probex-primary)' }}
          >
            try again
          </button>
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="text-xs font-semibold mt-1"
          style={{ color: 'var(--probex-text-secondary)' }}
        >
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-center -mt-1 mb-1" style={{ color: 'var(--probex-text-muted)' }}>
        Enter your email address and we&apos;ll send you a reset link.
      </p>

      <FormField label="Email Address" htmlFor="forgot-email" error={errors.email?.message}>
        <AuthInput
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          hasError={!!errors.email}
          {...register('email')}
        />
      </FormField>

      <AuthSubmit
        isLoading={isSubmitting}
        label="Send Reset Link"
        loadingLabel="Sending…"
      />

      <p className="text-center text-xs mt-1" style={{ color: 'var(--probex-text-muted)' }}>
        Remember your password?{' '}
        <Link href={ROUTES.LOGIN} className="font-semibold" style={{ color: 'var(--probex-primary)' }}>
          Sign in
        </Link>
      </p>
    </form>
  )
}
