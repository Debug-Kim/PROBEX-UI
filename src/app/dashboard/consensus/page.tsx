import type { Metadata } from 'next'
import { ConsensusEnginePage } from '@/components/consensus/ConsensusEnginePage'

export const metadata: Metadata = {
  title: 'Consensus Engine — Probex',
  description: 'The Probex four-layer intelligence engine: Market Data, AI Engine, Trading Engine, Research Layer.',
}

export default function Page() {
  return <ConsensusEnginePage />
}
