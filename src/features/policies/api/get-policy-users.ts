import { useInfiniteQuery } from '@tanstack/react-query'

import type { RemoteDataState } from '@/components/data/remote-data/remote-data.types'
import { apiPaths } from '@/config'
import { api } from '@/lib'
import type { User } from '@/types'
import { commonQueryOptions } from '@/utils'

import type {
  GetPolicyUsersQuery,
  UsePolicyUsersQuery,
} from '../types/policy-api.types'
import { policyQueryKeys } from '../utils/policy-query-keys'

export async function getPolicyUsers({
  policyId,
  ...params
}: GetPolicyUsersQuery): Promise<User[]> {
  const response = await api.get<User[]>(apiPaths.policies.users(policyId), {
    params,
  })
  return response.data
}

export function usePolicyUsers(
  params: UsePolicyUsersQuery,
): RemoteDataState<User> {
  const query = useInfiniteQuery({
    ...commonQueryOptions,
    queryKey: policyQueryKeys.users(params.policyId, params),
    queryFn: ({ pageParam }) =>
      getPolicyUsers({
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
