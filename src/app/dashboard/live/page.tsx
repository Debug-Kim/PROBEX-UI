import type { Metadata } from 'next'
import { LiveMarketsView } from '@/components/live'

export const metadata: Metadata = {
  title: 'Live Markets — Probex',
  description: 'Real-time Bitcoin prediction market intelligence',
}

export default function LivePage() {
  return <LiveMarketsView />
}
