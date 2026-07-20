import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { normalizePolicy, type PolicyDto } from '@/api/policies'
import { apiPaths, queryKeys } from '@/config'
import { api } from '@/lib'
import type { Policy } from '@/types'

import type { TerminatePolicyAction } from '../types/policy-api.types'

export async function terminatePolicy({
  policyId,
}: TerminatePolicyAction): Promise<Policy> {
  const response = await api.patch<PolicyDto>(
    apiPaths.policies.terminate(policyId),
  )
  return normalizePolicy(response.data)
}

export function useTerminatePolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: terminatePolicy,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.policies.all() })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.limits.all(),
      })
      void toast.success('Policy terminated successfully')
    },
  })
}
