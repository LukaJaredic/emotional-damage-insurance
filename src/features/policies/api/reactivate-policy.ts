import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { normalizePolicy, type PolicyDto } from '@/api/policies'
import { apiPaths, queryKeys } from '@/config'
import { api } from '@/lib'
import type { Policy } from '@/types'

import type { ReactivatePolicyAction } from '../types/policy-api.types'

export async function reactivatePolicy({
  policyId,
}: ReactivatePolicyAction): Promise<Policy> {
  const response = await api.patch<PolicyDto>(
    apiPaths.policies.reactivate(policyId),
  )
  return normalizePolicy(response.data)
}

export function useReactivatePolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reactivatePolicy,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.policies.all() })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.limits.all(),
      })
      void toast.success('Policy reactivated successfully')
    },
  })
}
