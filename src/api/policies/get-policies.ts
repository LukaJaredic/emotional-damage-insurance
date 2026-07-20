import { useInfiniteQuery } from '@tanstack/react-query'

import type { RemoteDataState } from '@/components/data/remote-data/remote-data.types'
import { apiPaths, queryKeys } from '@/config'
import { api } from '@/lib'
import type { Policy } from '@/types'
import { commonQueryOptions } from '@/utils'

import { normalizePolicy } from './normalize-policy'
import type {
  GetPoliciesQuery,
  PolicyDto,
  UsePoliciesQuery,
} from './policy-api.types'

export async function getPolicies(params: GetPoliciesQuery): Promise<Policy[]> {
  const response = await api.get<PolicyDto[]>(apiPaths.policies.all(), {
    params,
  })
  return response.data.map(normalizePolicy)
}

function buildGetPoliciesQuery(
  params: UsePoliciesQuery,
  page: number,
): GetPoliciesQuery {
  const { terminated, ...rest } = params
  const normalizedTerminated =
    terminated === 'true' ? true : terminated === 'false' ? false : undefined

  return {
    ...rest,
    page,
    ...(normalizedTerminated !== undefined
      ? { terminated: normalizedTerminated }
      : {}),
  }
}

export function usePolicies(params: UsePoliciesQuery): RemoteDataState<Policy> {
  const query = useInfiniteQuery({
    ...commonQueryOptions,
    queryKey: queryKeys.policies.list(params),
    queryFn: ({ pageParam }) =>
      getPolicies(buildGetPoliciesQuery(params, pageParam)),
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
