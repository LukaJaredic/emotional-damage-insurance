import { DEFAULT_PAGE_LOAD_SIZE } from '@/lib'

import type { UsePolicyHoldersQuery } from '../types/policy-holder-api.types'

export const policyHolderQueryKeys = {
  all: () => ['policy-holders'] as const,
  list: ({ perPage, search, type }: UsePolicyHoldersQuery) =>
    [
      'policy-holders',
      'list',
      perPage ?? DEFAULT_PAGE_LOAD_SIZE,
      search ?? '',
      type ?? '',
    ] as const,
  detail: (policyHolderId: string) =>
    ['policy-holders', 'detail', policyHolderId] as const,
}
