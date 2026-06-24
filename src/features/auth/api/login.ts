import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import { apiPaths } from '@/config'
import { api } from '@/lib'
import type { User } from '@/types'

import type { LoginAction } from '../types/login.types'
import { onSuccessfulLogin } from '../utils/login'

async function login(data: LoginAction): Promise<User> {
  const response = await api.post(apiPaths.auth.login(), data)
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
