import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiPaths, queryKeys } from '@/config'
import { api } from '@/lib'
import type { PolicyUser } from '@/types'

import type { ConnectPolicyUserAction } from './policy-api.types'

export async function connectPolicyUser({
  policyId,
  userId,
}: ConnectPolicyUserAction): Promise<PolicyUser> {
  const response = await api.post<PolicyUser>(
    apiPaths.policies.users(policyId),
    {
      userId,
    },
  )
  return response.data
}

export function useConnectPolicyUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: connectPolicyUser,
    onSuccess: (_, { policyId, userId }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.policies.detail(policyId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.limits.detail(userId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.all(),
      })
      void toast.success('User connected to policy successfully')
    },
  })
}
