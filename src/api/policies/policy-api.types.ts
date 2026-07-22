import type { Policy, PolicyLimits } from '@/types'

export type PolicyDto = Omit<Policy, 'startDate' | 'endDate'> & {
  startDate: string
  endDate: string
}

export type CreatePolicyAction = {
  policyHolderId: string
  name: string
  premium: number
  startDate: string
  endDate: string
  limits: PolicyLimits
}

export type GetPoliciesQuery = {
  page: number
  perPage?: number
  search?: string
  terminated?: boolean
  policyHolderId?: string
  userId?: string
  startAfterDate?: string
  endBeforeDate?: string
}

export type UsePoliciesQuery = Omit<GetPoliciesQuery, 'page' | 'terminated'> & {
  terminated?: string
}
