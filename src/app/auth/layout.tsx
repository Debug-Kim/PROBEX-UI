import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { APP_NAME } from '@/config/constants'

export const metadata: Metadata = {
  title: {
    template: `%s · ${APP_NAME}`,
    default:  `${APP_NAME} — Sign In`,
  },
}

interface AuthLayoutProps {
  children: ReactNode
}

/**
 * Auth layout — full-screen, no sidebar or top navigation.
 * Each auth page renders <AuthShell>, which owns the branded background,
 * header lockup, centered card, and footer. This layout is a passthrough
 * so the shell controls the full viewport without a nested wrapper.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return <>{children}</>
}
