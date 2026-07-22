import type { Policy } from '@/types'

export type GetPolicyQuery = {
  policyId: Policy['id']
}

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
