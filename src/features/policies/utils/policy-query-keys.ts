import { DEFAULT_PAGE_LOAD_SIZE } from '@/config'

import type {
  UsePoliciesQuery,
  UsePolicyUsersQuery,
} from '../types/policy-api.types'

export const policyQueryKeys = {
  all: () => ['policies'] as const,
  list: ({
    perPage,
    search,
    terminated,
    policyHolderId,
    userId,
    startAfterDate,
    endBeforeDate,
  }: UsePoliciesQuery) =>
    [
      'policies',
      perPage ?? DEFAULT_PAGE_LOAD_SIZE,
      search ?? '',
      terminated ?? '',
      policyHolderId ?? '',
      userId ?? '',
      startAfterDate ?? '',
      endBeforeDate ?? '',
    ] as const,
  detail: (policyId: string) => ['policies', policyId] as const,
  users: ({ policyId, perPage, search }: UsePolicyUsersQuery) =>
    [
      'policies',
      policyId,
      'users',
      perPage ?? DEFAULT_PAGE_LOAD_SIZE,
      search ?? '',
    ] as const,
}
