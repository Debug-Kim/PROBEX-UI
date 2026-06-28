import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm'

export const metadata: Metadata = {
  title: 'Verify Email',
}

/**
 * Email-verification page — reached after signup or from the emailed link.
 * The `?email=` query param is surfaced in the copy (mock validation).
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <AuthShell
      title="Verify your email"
      subtitle="One quick step to secure your account"
    >
      <VerifyEmailForm email={email} />
    </AuthShell>
  )
}
