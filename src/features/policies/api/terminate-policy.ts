import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiPaths } from '@/config'
import { api } from '@/lib'
import type { Policy } from '@/types'

import type { TerminatePolicyAction } from '../types/policy-api.types'
import { policyQueryKeys } from '../utils/policy-query-keys'

export async function terminatePolicy({
  policyId,
}: TerminatePolicyAction): Promise<Policy> {
  const response = await api.patch<Policy>(
    apiPaths.policies.terminate(policyId),
  )
  return response.data
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
