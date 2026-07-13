import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiPaths, queryKeys } from '@/config'
import { api } from '@/lib/api'
import type { PolicyHolder } from '@/types'

import type { CreatePolicyHolderAction } from '../types/policy-holder-api.types'

export async function createPolicyHolder(
  data: CreatePolicyHolderAction,
): Promise<PolicyHolder> {
  const response = await api.post<PolicyHolder>(
    apiPaths.policyHolders.all(),
    data,
  )
  return response.data
}

export function useCreatePolicyHolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPolicyHolder,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.policyHolders.all(),
      })
      void toast.success('Policy holder created successfully')
    },
  })
}
