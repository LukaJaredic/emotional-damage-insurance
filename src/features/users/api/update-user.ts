import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api } from '@/lib'
import type { User } from '@/types'

import type { UpdateUserAction } from '../types/user-api.types'
import { userQueryKeys } from '../utils/user-query-keys'

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
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.all() })
      void toast.success('User updated successfully')
    },
  })
}
