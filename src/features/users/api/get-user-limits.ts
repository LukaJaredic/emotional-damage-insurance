import { useQuery, type QueryOptions } from '@tanstack/react-query'
import type { AxiosRequestConfig } from 'axios'

import { apiPaths, queryKeys } from '@/config'
import { api } from '@/lib'
import type { PolicyWithUserLimits, User } from '@/types'

type PolicyWithUserLimitsDto = Omit<
  PolicyWithUserLimits,
  'startDate' | 'endDate'
> & {
  startDate: string
  endDate: string
}

export type GetUserLimitsQuery = {
  userId: User['id']
}

function normalizePolicyWithUserLimits(
  policy: PolicyWithUserLimitsDto,
): PolicyWithUserLimits {
  return {
    ...policy,
    startDate: new Date(policy.startDate),
    endDate: new Date(policy.endDate),
  }
}

export async function getUserLimits(
  { userId }: GetUserLimitsQuery,
  config?: AxiosRequestConfig,
): Promise<PolicyWithUserLimits[]> {
  const response = await api.get<PolicyWithUserLimitsDto[]>(
    apiPaths.users.limits(userId),
    config,
  )

  return response.data.map(normalizePolicyWithUserLimits)
}

export function useUserLimits(
  { userId }: GetUserLimitsQuery,
  queryOptions?: QueryOptions<PolicyWithUserLimits[]>,
) {
  return useQuery({
    queryKey: queryKeys.users.limits.detail(userId),
    queryFn: () => getUserLimits({ userId }),
    retry: false,
    ...queryOptions,
  })
}
