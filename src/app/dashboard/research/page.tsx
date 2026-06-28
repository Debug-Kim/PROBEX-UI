import type { Metadata } from 'next'
import { ResearchOverview } from '@/components/research'

export const metadata: Metadata = {
  title: 'Research | Probex',
  description:
    'Intelligence reports, deep dives, and market analysis from the Probex Consensus Engine team.',
}

export default function ResearchPage() {
  return <ResearchOverview />
}
