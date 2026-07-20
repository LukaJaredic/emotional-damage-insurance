import { useQuery, type QueryOptions } from '@tanstack/react-query'

import { apiPaths, queryKeys } from '@/config'
import { api } from '@/lib/api'
import type { PolicyHolder } from '@/types'

export type GetPolicyHolderQuery = {
  policyHolderId: string
}

export async function getPolicyHolder({
  policyHolderId,
}: GetPolicyHolderQuery): Promise<PolicyHolder> {
  const response = await api.get<PolicyHolder>(
    apiPaths.policyHolders.one(policyHolderId),
  )
  return response.data
}

export function usePolicyHolderDetail(
  { policyHolderId }: GetPolicyHolderQuery,
  queryOptions?: QueryOptions<PolicyHolder>,
) {
  return useQuery({
    queryKey: queryKeys.policyHolders.detail(policyHolderId),
    queryFn: () => getPolicyHolder({ policyHolderId }),
    retry: false,
    ...queryOptions,
  })
}
