import { DEFAULT_PAGE_LOAD_SIZE } from '@/config'

import type { UsePolicyUsersQuery } from '../types/policy-api.types'

export const policyQueryKeys = {
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
