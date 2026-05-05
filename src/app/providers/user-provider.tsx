import { useState } from 'react'

import type { User } from '@/types/user'
import { UserContext } from '@app/providers/user-context'

type UserProviderProps = {
  children: React.ReactNode
}

function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider
