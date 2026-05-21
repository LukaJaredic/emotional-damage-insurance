import type { UseUsersQuery } from '@/features/users/types/users.types'

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
        perPage ?? 25,
        search ?? '',
        'roles',
        ...[...(roles ?? [])].sort(),
      ] as const,
    detail: (userId: string) => ['users', 'detail', userId] as const,
  },
}
