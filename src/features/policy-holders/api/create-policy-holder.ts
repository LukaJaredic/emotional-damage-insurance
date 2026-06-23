import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api } from '@/lib/api'
import type { PolicyHolder } from '@/types'

import type { CreatePolicyHolderAction } from '../types/policy-holder-api.types'
import { policyHolderQueryKeys } from '../utils/policy-holder-query-keys'

export async function createPolicyHolder(
  data: CreatePolicyHolderAction,
): Promise<PolicyHolder> {
  const response = await api.post<PolicyHolder>('/policy-holders', data)
  return response.data
}

export function useCreatePolicyHolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPolicyHolder,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: policyHolderQueryKeys.all(),
      })
      void toast.success('Policy holder created successfully')
    },
  })
}
