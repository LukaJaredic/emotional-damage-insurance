import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/config/query-keys'
import { api } from '@/lib/api'
import type { User } from '@/types/user'

import type { UpdateUserAction } from '../types/users.types'

export async function updateUser({
  userId,
  data,
}: UpdateUserAction): Promise<User> {
  const response = await api.patch<User>(`/users/${userId}`, data)
  return response.data
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })
}
