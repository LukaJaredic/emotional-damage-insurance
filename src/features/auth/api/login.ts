import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { useUser } from '@/hooks/use-user'
import { api } from '@/lib/api'
import type { User } from '@/types/user'

import type { LoginFormData } from '../utils/login'

async function login(data: LoginFormData): Promise<{ user: User }> {
  const response = await api.post('/auth/login', data)
  return response.data
}

export const useLogin = (redirectTo: string) => {
  const navigate = useNavigate()
  const { setUser } = useUser()

  return useMutation({
    mutationFn: (data: LoginFormData) => login(data),
    onSuccess: (data) => {
      setUser(data.user)
      navigate(redirectTo)
    },
  })
}
