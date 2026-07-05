import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiPaths } from '@/config'
import { api } from '@/lib'
import type { Policy } from '@/types'

import type {
  PolicyDto,
  ReactivatePolicyAction,
} from '../types/policy-api.types'
import { normalizePolicy } from '../utils/normalize-policy'
import { policyQueryKeys } from '../utils/policy-query-keys'

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
      void queryClient.invalidateQueries({ queryKey: policyQueryKeys.all() })
      void toast.success('Policy reactivated successfully')
    },
  })
}
