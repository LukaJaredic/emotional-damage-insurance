import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { apiPaths, paths } from '@/config'
import { api } from '@/lib'

import type { DeletePolicyHolderAction } from '../types/policy-holder-api.types'
import { policyHolderQueryKeys } from '../utils/policy-holder-query-keys'

export async function deletePolicyHolder({
  policyHolderId,
}: DeletePolicyHolderAction) {
  await api.delete(apiPaths.policyHolders.one(policyHolderId))
}

export function useDeletePolicyHolder() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: deletePolicyHolder,
    onSuccess: () => {
      navigate(paths.policyHolders.getHref(), { flushSync: true })
      void queryClient.invalidateQueries({
        queryKey: policyHolderQueryKeys.all(),
      })
      toast.success('Policy holder deleted successfully')
    },
  })
}
