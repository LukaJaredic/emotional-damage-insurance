import { DEFAULT_PAGE_LOAD_SIZE } from '@/lib'

import type { UseUsersQuery } from '../types/user-api.types'

export const userQueryKeys = {
  all: () => ['users'] as const,
  list: ({ perPage, search, roles }: UseUsersQuery) =>
    [
      'users',
      perPage ?? DEFAULT_PAGE_LOAD_SIZE,
      search ?? '',
      'roles',
      ...[...(roles ?? [])].sort(),
    ] as const,
}
