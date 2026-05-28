import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/config'
import { api } from '@/lib'

import type { DeleteUserAction } from '../types/user-api.types'

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
