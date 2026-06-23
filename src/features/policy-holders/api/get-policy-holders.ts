import { useInfiniteQuery } from 'node_modules/@tanstack/react-query/build/modern/_tsup-dts-rollup'

import type { RemoteDataState } from '@/components/data/remote-data/remote-data.types'
import { api } from '@/lib'
import type { PolicyHolder } from '@/types/policy-holder'
import { commonQueryOptions } from '@/utils/query'

import type {
  GetPolicyHoldersQuery,
  UsePolicyHoldersQuery,
} from '../types/policy-holder-api.types'
import { policyHolderQueryKeys } from '../utils/policy-holder-query-keys'

export async function getPolicyHolders(
  params: GetPolicyHoldersQuery,
): Promise<PolicyHolder[]> {
  const response = await api.get<PolicyHolder[]>('/policy-holders', { params })
  return response.data
}

export function usePolicyHolders(
  params: UsePolicyHoldersQuery,
): RemoteDataState<PolicyHolder> {
  const query = useInfiniteQuery({
    ...commonQueryOptions,
    queryKey: policyHolderQueryKeys.list(params),
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
