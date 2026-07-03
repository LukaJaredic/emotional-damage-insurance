import type { Policy, User } from '@/types'

import type { CreatePolicyFormValues } from './policy-form.types'

export type CreatePolicyAction = CreatePolicyFormValues

export type GetPolicyQuery = {
  policyId: Policy['id']
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

export type UsePoliciesQuery = Omit<GetPoliciesQuery, 'page'>

export type DeletePolicyAction = {
  policyId: Policy['id']
}

export type TerminatePolicyAction = {
  policyId: Policy['id']
}

export type ReactivatePolicyAction = {
  policyId: Policy['id']
}

export type GetPolicyUsersQuery = {
  policyId: Policy['id']
  page: number
  perPage?: number
  search?: string
}

export type UsePolicyUsersQuery = Omit<GetPolicyUsersQuery, 'page'>

export type ConnectPolicyUserAction = {
  policyId: Policy['id']
  userId: User['id']
}

export type DisconnectPolicyUserAction = {
  policyId: Policy['id']
  userId: User['id']
}
