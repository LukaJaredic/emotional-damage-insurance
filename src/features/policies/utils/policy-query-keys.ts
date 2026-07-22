import { DEFAULT_PAGE_LOAD_SIZE } from '@/config'

import type {
  UseConnectedPolicyUsersQuery,
  UseNotConnectedPolicyUsersQuery,
} from '../types/policy-api.types'

export const policyQueryKeys = {
  connectedUsers: ({
    policyId,
    perPage,
    search,
  }: UseConnectedPolicyUsersQuery) =>
    [
      'policies',
      policyId,
      'users/connected',
      perPage ?? DEFAULT_PAGE_LOAD_SIZE,
      search ?? '',
    ] as const,
  notConnectedUsers: ({
    policyId,
    perPage,
    search,
  }: UseNotConnectedPolicyUsersQuery) =>
    [
      'policies',
      policyId,
      'users/not-connected',
      perPage ?? DEFAULT_PAGE_LOAD_SIZE,
      search ?? '',
    ] as const,
}
