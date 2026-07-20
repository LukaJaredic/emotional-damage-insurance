import type { GetPoliciesQuery } from '@/api/policies/policy-api.types'
import type { GetPolicyHoldersQuery } from '@/api/policy-holders/policy-holder-api.types'

import { DEFAULT_PAGE_LOAD_SIZE } from './pagination'

type PolicyHolderListQuery = Omit<GetPolicyHoldersQuery, 'page'>

type PolicyListQuery = Omit<GetPoliciesQuery, 'page' | 'terminated'> & {
  terminated?: string
}

export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  policyHolders: {
    all: () => ['policy-holders'] as const,
    list: ({ perPage, search, type }: PolicyHolderListQuery = {}) =>
      [
        'policy-holders',
        perPage ?? DEFAULT_PAGE_LOAD_SIZE,
        search ?? '',
        type ?? '',
      ] as const,
    detail: (policyHolderId: string) =>
      ['policy-holders', policyHolderId] as const,
  },
  policies: {
    all: () => ['policies'] as const,
    list: ({
      perPage,
      search,
      terminated,
      policyHolderId,
      userId,
      startAfterDate,
      endBeforeDate,
    }: PolicyListQuery) =>
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
  },
  users: {
    detail: (userId: string) => ['users', userId] as const,
    limits: {
      all: () => ['users', 'limits'] as const,
      detail: (userId: string) => ['users', 'limits', userId] as const,
    },
  },
}
