import type { PolicyHolder, PolicyHolderType } from '@/types'

export const typeLabels: Record<PolicyHolderType, string> = {
  individual: 'Individual',
  business: 'Business',
}

export const name = (policyHolder: PolicyHolder) => {
  return policyHolder.type === 'business'
    ? policyHolder.businessName
    : `${policyHolder.firstName} ${policyHolder.lastName}`
}
