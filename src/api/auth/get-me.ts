import { useQuery, type QueryOptions } from '@tanstack/react-query'

import { apiPaths, queryKeys } from '@/config'
import { api } from '@/lib'
import type { User } from '@/types'

async function getMe() {
  const { data } = await api.get<User>(apiPaths.auth.me())
  return data
}

export function useMe(queryOptions?: QueryOptions<User>) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    staleTime: Infinity,
    queryFn: getMe,
    retry: false,
    ...queryOptions,
  })
}
