import { useQuery, type QueryOptions } from '@tanstack/react-query'
import type { AxiosRequestConfig } from 'axios'

import { apiPaths, queryKeys } from '@/config'
import { api } from '@/lib'
import type { User } from '@/types'

export type GetUserQuery = {
  userId: User['id']
}

export async function getUser(
  { userId }: GetUserQuery,
  config?: AxiosRequestConfig,
): Promise<User> {
  const response = await api.get<User>(apiPaths.users.one(userId), config)
  return response.data
}

export function useUserDetail(
  { userId }: GetUserQuery,
  queryOptions?: QueryOptions<User>,
) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => getUser({ userId }),
    retry: false,
    ...queryOptions,
  })
}
