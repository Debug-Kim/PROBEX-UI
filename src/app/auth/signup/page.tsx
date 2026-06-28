import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Create Account',
}

/** Signup page — branded auth shell with the registration form. */
export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Probex — Bitcoin prediction intelligence"
    >
      <SignupForm />
    </AuthShell>
  )
}
