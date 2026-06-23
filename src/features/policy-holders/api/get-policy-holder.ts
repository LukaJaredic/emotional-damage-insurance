import { useQuery, type QueryOptions } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { PolicyHolder } from '@/types'

import type { GetPolicyHolderQuery } from '../types/policy-holder-api.types'
import { policyHolderQueryKeys } from '../utils/policy-holder-query-keys'

export async function getPolicyHolder({
  policyHolderId,
}: GetPolicyHolderQuery): Promise<PolicyHolder> {
  const response = await api.get<PolicyHolder>(
    `/policy-holders/${policyHolderId}`,
  )
  return response.data
}

export function usePolicyHolderDetail(
  { policyHolderId }: GetPolicyHolderQuery,
  queryOptions?: QueryOptions<PolicyHolder>,
) {
  return useQuery({
    queryKey: policyHolderQueryKeys.detail(policyHolderId),
    queryFn: () => getPolicyHolder({ policyHolderId }),
    retry: false,
    ...queryOptions,
  })
}
