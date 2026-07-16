import type { Policy } from '@/types'
import { toEur } from '@/utils'

export { limitLabels } from '@/utils/policy-limit-labels'

import { status } from './policy-status'

export const policyStatusLabels: Record<
  'active' | 'terminated' | 'expired' | 'future',
  string
> = {
  active: 'Active',
  terminated: 'Terminated',
  expired: 'Expired',
  future: 'Not started yet',
}

export function statusLabel(policy: Policy) {
  return policyStatusLabels[status(policy)]
}

export function premium(policy: Policy) {
  return toEur(policy.premium)
}
