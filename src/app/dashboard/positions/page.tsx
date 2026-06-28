import type { Metadata } from 'next'
import { PositionsView } from '@/components/positions/PositionsView'

export const metadata: Metadata = {
  title: 'Positions',
  description: 'Your open and settled prediction market positions with consensus alignment.',
}

export default function PositionsPage() {
  return <PositionsView />
}
