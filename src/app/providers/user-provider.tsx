import { useState } from 'react'
import type { ReactNode } from 'react'

import type { User } from '@/types/user'
import { UserContext } from '@app/providers/user-context'

type UserProviderProps = {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}
