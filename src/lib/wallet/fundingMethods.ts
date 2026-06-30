export type FundingMethodId = 'usdc-polygon' | 'crypto-transfer' | 'paypal' | 'bank-transfer'

export type FundingMethodCategory = 'crypto' | 'fiat'

export interface FundingMethod {
  id:             FundingMethodId
  name:           string
  description:    string
  category:       FundingMethodCategory
  settlementTime: string
  feeLabel:       string
  minAmount:      number
  maxAmount:      number
  isAvailable:    boolean
  iconLabel:      string
}

export const FUNDING_METHODS: FundingMethod[] = [
  {
    id:             'usdc-polygon',
    name:           'USDC on Polygon',
    description:    'Deposit USDC directly from your Polygon wallet. Fastest and lowest-fee option.',
    category:       'crypto',
    settlementTime: '~2 minutes',
    feeLabel:       'No fee',
    minAmount:      10,
    maxAmount:      250_000,
    isAvailable:    true,
    iconLabel:      'USDC',
  },
  {
    id:             'crypto-transfer',
    name:           'Crypto Transfer',
    description:    'Send USDC or other supported tokens from any wallet or exchange. Auto-converts to USDC.',
    category:       'crypto',
    settlementTime: '5–15 minutes',
    feeLabel:       '0.5% conversion fee',
    minAmount:      25,
    maxAmount:      100_000,
    isAvailable:    true,
    iconLabel:      'CRY',
  },
  {
    id:             'paypal',
    name:           'PayPal',
    description:    'Fund your account using your PayPal balance or linked cards.',
    category:       'fiat',
    settlementTime: '1–2 business days',
    feeLabel:       '2.9% + $0.30',
    minAmount:      20,
    maxAmount:      10_000,
    isAvailable:    true,
    iconLabel:      'PP',
  },
  {
    id:             'bank-transfer',
    name:           'Bank Transfer (ACH)',
    description:    'Direct transfer from a linked US bank account.',
    category:       'fiat',
    settlementTime: '2–4 business days',
    feeLabel:       'No fee',
    minAmount:      50,
    maxAmount:      50_000,
    isAvailable:    true,
    iconLabel:      'ACH',
  },
]

export function getFundingMethod(id: FundingMethodId): FundingMethod | undefined {
  return FUNDING_METHODS.find((m) => m.id === id)
}

export function getFundingMethodsByCategory(category: FundingMethodCategory): FundingMethod[] {
  return FUNDING_METHODS.filter((m) => m.category === category)
}
