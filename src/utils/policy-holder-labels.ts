import type { PolicyHolder, PolicyHolderType } from '@/types'

export const policyHolderTypeLabels: Record<PolicyHolderType, string> = {
  individual: 'Individual',
  business: 'Business',
}

export const policyHolderName = (policyHolder: PolicyHolder) => {
  return policyHolder.type === 'business'
    ? policyHolder.businessName
    : `${policyHolder.firstName} ${policyHolder.lastName}`
}
