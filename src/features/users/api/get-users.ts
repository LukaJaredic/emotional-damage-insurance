import { useInfiniteQuery } from '@tanstack/react-query'

import type { RemoteDataState } from '@/components/data-view/remote-data.types'
import { queryKeys } from '@/config/query-keys'
import { api } from '@/lib/api'
import type { User } from '@/types/user'
import { commonQueryOptions } from '@/utils/query'

import type { GetUsersQuery, UseUsersQuery } from '../types/users.types'

export async function getUsers(params: GetUsersQuery): Promise<User[]> {
  const response = await api.get<User[]>('/users', { params })
  return response.data
}

export function useUsers(params: UseUsersQuery): RemoteDataState<User> {
  const perPage = 25

  const query = useInfiniteQuery({
    ...commonQueryOptions,
    queryKey: queryKeys.users.list({ ...params, perPage }),
    queryFn: ({ pageParam }) =>
      getUsers({
        ...params,
        perPage,
        page: pageParam,
      }),
  })

  return {
    items: query.data?.pages.flat() ?? [],
    isInitialLoading: query.isPending,
    isFetchingMore: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage,
  }
}
