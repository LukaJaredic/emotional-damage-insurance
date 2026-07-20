import { useInfiniteQuery } from '@tanstack/react-query'

import type { RemoteDataState } from '@/components/data/remote-data'
import { apiPaths, queryKeys } from '@/config'
import { api } from '@/lib'
import type { PolicyHolder } from '@/types'
import { commonQueryOptions } from '@/utils'

import type { GetPolicyHoldersQuery } from './policy-holder-api.types'

export type UsePolicyHoldersQuery = Omit<GetPolicyHoldersQuery, 'page'>

export async function getPolicyHolders(
  params: GetPolicyHoldersQuery,
): Promise<PolicyHolder[]> {
  const response = await api.get<PolicyHolder[]>(apiPaths.policyHolders.all(), {
    params,
  })
  return response.data
}

export function usePolicyHolders(
  params: UsePolicyHoldersQuery,
): RemoteDataState<PolicyHolder> {
  const query = useInfiniteQuery({
    ...commonQueryOptions,
    queryKey: queryKeys.policyHolders.list(params),
    queryFn: ({ pageParam }) =>
      getPolicyHolders({
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
