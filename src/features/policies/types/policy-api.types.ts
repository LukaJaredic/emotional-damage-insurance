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

export type GetConnectedPolicyUsersQuery = {
  policyId: Policy['id']
  page: number
  perPage?: number
  search?: string
}

export type UseConnectedPolicyUsersQuery = Omit<
  GetConnectedPolicyUsersQuery,
  'page'
>

export type GetNotConnectedPolicyUsersQuery = GetConnectedPolicyUsersQuery

export type UseNotConnectedPolicyUsersQuery = Omit<
  GetNotConnectedPolicyUsersQuery,
  'page'
>
