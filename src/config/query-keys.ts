import { DEFAULT_PAGE_LOAD_SIZE } from '@/lib'
import type { PolicyHolderType } from '@/types'

type PolicyHolderListQuery = {
  perPage?: number
  search?: string
  type?: PolicyHolderType
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
  users: {
    detail: (userId: string) => ['users', userId] as const,
  },
}
