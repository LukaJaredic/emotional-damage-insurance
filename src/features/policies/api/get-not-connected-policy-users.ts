import { useInfiniteQuery } from '@tanstack/react-query'

import type { RemoteDataState } from '@/components/data/remote-data/remote-data.types'
import { apiPaths } from '@/config'
import { api } from '@/lib'
import type { User } from '@/types'
import { commonQueryOptions } from '@/utils'

import type {
  GetNotConnectedPolicyUsersQuery,
  UseNotConnectedPolicyUsersQuery,
} from '../types/policy-api.types'
import { policyQueryKeys } from '../utils/policy-query-keys'

export async function getNotConnectedPolicyUsers({
  policyId,
  ...params
}: GetNotConnectedPolicyUsersQuery): Promise<User[]> {
  const response = await api.get<User[]>(
    apiPaths.policies.notConnectedUsers(policyId),
    { params },
  )
  return response.data
}

export function useNotConnectedPolicyUsers(
  params: UseNotConnectedPolicyUsersQuery,
): RemoteDataState<User> {
  const query = useInfiniteQuery({
    ...commonQueryOptions,
    queryKey: policyQueryKeys.notConnectedUsers(params),
    queryFn: ({ pageParam }) =>
      getNotConnectedPolicyUsers({
        ...params,
        page: pageParam,
      }),
  })

  return {
    items: query.data?.pages.flat() ?? [],
    isInitialLoading: query.isPending,
    isFetchingMore: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage,
    isError: query.isError,
  }
}
