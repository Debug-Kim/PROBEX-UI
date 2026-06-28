import type { Metadata } from 'next'
import { AdminConsole } from '@/components/admin/AdminConsole'

export const metadata: Metadata = { title: 'Admin Console' }

/** Admin Console route. */
export default function Page() {
  return <AdminConsole />
}
