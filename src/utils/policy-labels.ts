import type { Policy } from '@/types'

import { toEur } from './currency'
import { policyStatus } from './policy-status'

export const policyStatusLabels: Record<
  'active' | 'terminated' | 'expired' | 'future',
  string
> = {
  active: 'Active',
  terminated: 'Terminated',
  expired: 'Expired',
  future: 'Not started yet',
}

export function policyStatusLabel(policy: Policy) {
  return policyStatusLabels[policyStatus(policy)]
}

export function policyPremium(policy: Policy) {
  return toEur(policy.premium)
}
