import { useQuery, type QueryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/config'
import { api } from '@/lib'
import type { User } from '@/types'

import type { GetUserQuery } from '../types/api.types'

export async function getUser({ userId }: GetUserQuery): Promise<User> {
  const response = await api.get<User>(`/users/${userId}`)
  return response.data
}

export function useUserDetail(
  { userId }: GetUserQuery,
  queryOptions?: QueryOptions<User>,
) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => getUser({ userId }),
    ...queryOptions,
  })
}
