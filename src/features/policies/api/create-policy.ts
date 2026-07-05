import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiPaths } from '@/config'
import { api } from '@/lib'
import type { Policy } from '@/types'

import type { CreatePolicyAction, PolicyDto } from '../types/policy-api.types'
import { normalizePolicy } from '../utils/normalize-policy'
import { policyQueryKeys } from '../utils/policy-query-keys'

export async function createPolicy(data: CreatePolicyAction): Promise<Policy> {
  const response = await api.post<PolicyDto>(apiPaths.policies.all(), data)
  return normalizePolicy(response.data)
}

export function useCreatePolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: policyQueryKeys.all() })
      void toast.success('Policy created successfully')
    },
  })
}
