import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiPaths, queryKeys } from '@/config'
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
    onSuccess: (_, { policyId, userId }) => {
      void queryClient.invalidateQueries({
        queryKey: policyQueryKeys.detail(policyId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.limits.detail(userId),
      })
      void toast.success('User disconnected from policy successfully')
    },
  })
}
