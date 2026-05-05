import { createContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import type { User } from '@/types/user'

export type UserContextValue = {
  user: User | null
  setUser: Dispatch<SetStateAction<User | null>>
}

export const UserContext = createContext<UserContextValue | undefined>(
  undefined,
)
