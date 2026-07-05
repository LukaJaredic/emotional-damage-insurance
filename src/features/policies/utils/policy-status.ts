import type { Policy, PolicyStatus } from '@/types'

export function status(policy: Policy): PolicyStatus {
  if (policy.terminated) {
    return 'terminated'
  }

  const now = new Date()

  if (policy.startDate > now) {
    return 'future'
  }

  if (policy.endDate < now) {
    return 'expired'
  }

  return 'active'
}
