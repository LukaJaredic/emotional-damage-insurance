import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { paths } from '@/config'
import { api } from '@/lib'

import type { DeletePolicyHolderAction } from '../types/policy-holder-api.types'
import { policyHolderQueryKeys } from '../utils/policy-holder-query-keys'

export async function deletePolicyHolder({
  policyHolderId,
}: DeletePolicyHolderAction) {
  await api.delete(`/policy-holders/${policyHolderId}`)
}

export function useDeletePolicyHolder() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: deletePolicyHolder,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: policyHolderQueryKeys.all(),
      })
      navigate(paths.policyHolders.getHref())
      toast.success('Policy holder deleted successfully')
    },
  })
}
