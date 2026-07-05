import type { Policy } from '@/types'

import type { PolicyDto } from '../types/policy-api.types'

export function normalizePolicy(policy: PolicyDto): Policy {
  return {
    ...policy,
    startDate: new Date(policy.startDate),
    endDate: new Date(policy.endDate),
  }
}
