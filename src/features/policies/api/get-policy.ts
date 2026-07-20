import { useQuery, type QueryOptions } from '@tanstack/react-query'

import { normalizePolicy, type PolicyDto } from '@/api/policies'
import { apiPaths } from '@/config'
import { api } from '@/lib'
import type { Policy } from '@/types'

import type { GetPolicyQuery } from '../types/policy-api.types'
import { policyQueryKeys } from '../utils/policy-query-keys'

export async function getPolicy({ policyId }: GetPolicyQuery): Promise<Policy> {
  const response = await api.get<PolicyDto>(apiPaths.policies.one(policyId))
  return normalizePolicy(response.data)
}

export function usePolicyDetail(
  { policyId }: GetPolicyQuery,
  queryOptions?: QueryOptions<Policy>,
) {
  return useQuery({
    queryKey: policyQueryKeys.detail(policyId),
    queryFn: () => getPolicy({ policyId }),
    retry: false,
    ...queryOptions,
  })
}
