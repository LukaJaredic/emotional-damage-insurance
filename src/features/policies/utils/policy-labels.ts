import type { Policy } from '@/types'
import { toEur } from '@/utils'

export const policyStatusLabels: Record<'active' | 'terminated', string> = {
  active: 'Active',
  terminated: 'Terminated',
}

export function status(policy: Policy) {
  return policy.terminated
    ? policyStatusLabels.terminated
    : policyStatusLabels.active
}

export function premium(policy: Policy) {
  return toEur(policy.premium)
}
