import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/config/query-keys'
import { api } from '@/lib/api'

import type { DeleteUserAction } from '../types/users'

export async function deleteUser({ userId }: DeleteUserAction) {
  await api.delete(`/users/${userId}`)
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })
}
