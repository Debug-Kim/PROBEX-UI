import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password',
}

/**
 * Forgot-password page — sends a reset link (mock).
 * The form renders its own "check your inbox" success state.
 */
export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="We'll email you a secure reset link"
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
