import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { apiPaths, paths } from '@/config'
import { api } from '@/lib'

import type { DeletePolicyAction } from '../types/policy-api.types'
import { policyQueryKeys } from '../utils/policy-query-keys'

export function deletePolicy({ policyId }: DeletePolicyAction) {
  return api.delete(apiPaths.policies.one(policyId))
}

export function useDeletePolicy() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: deletePolicy,
    onSuccess: () => {
      navigate(paths.policies.getHref(), { flushSync: true })
      void queryClient.invalidateQueries({ queryKey: policyQueryKeys.all() })
      toast.success('Policy deleted successfully')
    },
  })
}
