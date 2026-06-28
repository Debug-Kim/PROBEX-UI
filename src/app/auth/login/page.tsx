import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
}

/** Login page — branded auth shell with the email/password form. */
export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Probex intelligence terminal"
    >
      <LoginForm />
    </AuthShell>
  )
}
