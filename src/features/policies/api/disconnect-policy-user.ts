import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiPaths } from '@/config'
import { api } from '@/lib'

import type { DisconnectPolicyUserAction } from '../types/policy-api.types'
import { policyQueryKeys } from '../utils/policy-query-keys'

export function disconnectPolicyUser({
  policyId,
  userId,
}: DisconnectPolicyUserAction) {
  return api.delete(apiPaths.policies.user(policyId, userId))
}

export function useDisconnectPolicyUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: disconnectPolicyUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: policyQueryKeys.all() })
      void toast.success('User disconnected from policy successfully')
    },
  })
}
