import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password',
}

/**
 * Reset-password page — reached from the emailed reset link.
 * The `?token=` query param is forwarded to the form (mock validation).
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Secure your Probex account"
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  )
}
