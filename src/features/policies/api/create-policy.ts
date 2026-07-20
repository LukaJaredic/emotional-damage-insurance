import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { normalizePolicy, type PolicyDto } from '@/api/policies'
import { apiPaths, queryKeys } from '@/config'
import { api } from '@/lib'
import type { Policy } from '@/types'

import type { CreatePolicyAction } from '../types/policy-api.types'

export async function createPolicy(data: CreatePolicyAction): Promise<Policy> {
  const response = await api.post<PolicyDto>(apiPaths.policies.all(), data)
  return normalizePolicy(response.data)
}

export function useCreatePolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.policies.all() })
      void toast.success('Policy created successfully')
    },
  })
}
