import type { NavigateFunction } from 'react-router-dom'
import { z } from 'zod'

import { queryKeys } from '@/config'
import { queryClient } from '@/lib'
import type { User } from '@/types'
import { email, requiredString } from '@/utils'

export const loginSchema = z.object({
  email: email(),
  password: requiredString(6),
})

export function onSuccessfulLogin(
  user: User,
  navigate: NavigateFunction,
  redirectTo: string,
) {
  queryClient.setQueryData(queryKeys.auth.me(), user)
  navigate(redirectTo)
}
