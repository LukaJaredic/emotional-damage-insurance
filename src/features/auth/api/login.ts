import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { api } from '@/lib/api'
import type { User } from '@/types/user'

import type { LoginAction } from '../types/login.types'
import { onSuccessfulLogin } from '../utils/login'

async function login(data: LoginAction): Promise<User> {
  const response = await api.post('/auth/login', data)
  return response.data
}

export const useLogin = (redirectTo: string) => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginAction) => login(data),
    onSuccess: (user) => {
      onSuccessfulLogin(user, navigate, redirectTo)
    },
  })
}
