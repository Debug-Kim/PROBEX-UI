import type { Bias } from '@/types/consensus'

export interface IntelligenceSummary {
  headline:   string
  narrative:  string
  verdict:    string
  conviction: 'High' | 'Moderate' | 'Low'
  direction:  Bias
}

export interface ExplainDriver {
  label:     string
  weight:    number
  direction: Bias
  detail:    string
}

export interface ConfidencePoint {
  timestamp:  number
  confidence: number
  lower:      number
  upper:      number
}

export interface ConsensusSnapshot {
  id:        string
  label:     string
  timestamp: number
  score:     number
  bias:      Bias
  signal:    string
  delta:     number
}
