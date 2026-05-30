import type { UseUsersQuery } from '@/features/users/types/user-api.types'
import { DEFAULT_PAGE_LOAD_SIZE } from '@/lib/react-query'

export const queryKeys = {
  auth: {
    me: () => ['me'] as const,
  },
  users: {
    all: () => ['users'] as const,
    list: ({ perPage, search, roles }: UseUsersQuery) =>
      [
        'users',
        'list',
        perPage ?? DEFAULT_PAGE_LOAD_SIZE,
        search ?? '',
        'roles',
        ...[...(roles ?? [])].sort(),
      ] as const,
    detail: (userId: string) => ['users', 'detail', userId] as const,
  },
}
