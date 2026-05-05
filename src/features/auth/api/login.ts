import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { api } from '@/lib/api'
import type { User } from '@/types/user'

import type { LoginFormData } from '../utils/login'

async function login(data: LoginFormData): Promise<User> {
  const response = await api.post('/auth/login', data)
  return response.data
}

export const useLogin = (redirectTo: string) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginFormData) => login(data),
    onSuccess: (user) => {
      queryClient.setQueryData(['me'], user)
      navigate(redirectTo)
    },
  })
}
