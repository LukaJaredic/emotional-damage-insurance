import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiPaths } from '@/config'
import { api } from '@/lib/api'
import type { PolicyHolder } from '@/types'

import type { UpdatePolicyHolderAction } from '../types/policy-holder-api.types'
import { policyHolderQueryKeys } from '../utils/policy-holder-query-keys'

export async function updatePolicyHolder({
  policyHolderId,
  data,
}: UpdatePolicyHolderAction): Promise<PolicyHolder> {
  const response = await api.patch<PolicyHolder>(
    apiPaths.policyHolders.one(policyHolderId),
    data,
  )
  return response.data
}

export function useUpdatePolicyHolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePolicyHolder,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: policyHolderQueryKeys.all(),
      })
      void toast.success('Policy holder updated successfully')
    },
  })
}
