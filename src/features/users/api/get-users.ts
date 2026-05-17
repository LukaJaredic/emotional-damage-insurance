import { useQuery, type QueryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/config/query-keys'
import { api } from '@/lib/api'
import type { User } from '@/types/user'

import type { GetUsersAction } from '../types/users'

export async function getUsers(params: GetUsersAction): Promise<User[]> {
  const response = await api.get<User[]>('/users', { params })
  return response.data
}

export function useUsers(
  params: GetUsersAction,
  queryOptions?: QueryOptions<User[]>,
) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => getUsers(params),
    ...queryOptions,
  })
}
