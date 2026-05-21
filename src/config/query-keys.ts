import type { GetUsersQuery } from '@/features/users/types/users.types'

export const queryKeys = {
  auth: {
    me: () => ['me'] as const,
  },
  users: {
    all: () => ['users'] as const,
    list: ({ page, perPage, search, roles }: GetUsersQuery) =>
      [
        'users',
        'list',
        page,
        perPage ?? 25,
        search ?? '',
        'roles',
        ...[...(roles ?? [])].sort(),
      ] as const,
    detail: (userId: string) => ['users', 'detail', userId] as const,
  },
}
