import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api } from '@/lib'
import type { User } from '@/types'

import type { CreateUserAction } from '../types/user-api.types'
import { userQueryKeys } from '../utils/user-query-keys'

export async function createUser(data: CreateUserAction): Promise<User> {
  const response = await api.post<User>('/users', data)
  return response.data
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.all() })
      void toast.success('User created successfully')
    },
  })
}
