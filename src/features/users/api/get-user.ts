import { useQuery, type QueryOptions } from '@tanstack/react-query'

import { api } from '@/lib'
import type { User } from '@/types'

import type { GetUserQuery } from '../types/user-api.types'
import { userQueryKeys } from '../utils/user-query-keys'

export async function getUser({ userId }: GetUserQuery): Promise<User> {
  const response = await api.get<User>(`/users/${userId}`)
  return response.data
}

export function useUserDetail(
  { userId }: GetUserQuery,
  queryOptions?: QueryOptions<User>,
) {
  return useQuery({
    queryKey: userQueryKeys.detail(userId),
    queryFn: () => getUser({ userId }),
    retry: false,
    ...queryOptions,
  })
}
