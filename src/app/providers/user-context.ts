import type { UseMutationResult } from '@tanstack/react-query'
import { createContext } from 'react'

import type { User } from '@/types/user'

export type UserContextValue = {
  user: User | null
  isLoading: boolean
  logout: UseMutationResult<void, Error, void, unknown>
}

export const UserContext = createContext<UserContextValue | undefined>(
  undefined,
)
