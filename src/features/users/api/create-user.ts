import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/config/query-keys'
import { api } from '@/lib/api'
import type { User } from '@/types/user'

import type { CreateUserAction } from '../types/users'

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
