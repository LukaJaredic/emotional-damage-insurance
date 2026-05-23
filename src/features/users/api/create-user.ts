import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/config'
import { api } from '@/lib'
import type { User } from '@/types'

import type { CreateUserAction } from '../types/api.types'

export async function createUser(data: CreateUserAction): Promise<User> {
  const response = await api.post<User>('/users', data)
  return response.data
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })
}
