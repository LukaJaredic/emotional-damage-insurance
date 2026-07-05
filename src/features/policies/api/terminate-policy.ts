import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiPaths } from '@/config'
import { api } from '@/lib'
import type { Policy } from '@/types'

import type {
  PolicyDto,
  TerminatePolicyAction,
} from '../types/policy-api.types'
import { normalizePolicy } from '../utils/normalize-policy'
import { policyQueryKeys } from '../utils/policy-query-keys'

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
      void queryClient.invalidateQueries({ queryKey: policyQueryKeys.all() })
      void toast.success('Policy terminated successfully')
    },
  })
}
