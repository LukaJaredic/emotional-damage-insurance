import type { NavigateFunction } from 'react-router-dom'
import { z } from 'zod'

import { queryKeys } from '@/config/query-keys'
import { queryClient } from '@/lib/react-query'
import type { User } from '@/types/user'
import { email, requiredString } from '@/utils/zod-schemas'

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
