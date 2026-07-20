import type { Policy } from '@/types'

export type PolicyDto = Omit<Policy, 'startDate' | 'endDate'> & {
  startDate: string
  endDate: string
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
