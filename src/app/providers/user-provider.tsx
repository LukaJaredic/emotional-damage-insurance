import type { ReactNode } from 'react'

import { useLogout, useMe } from '@/api'
import { UserContext } from '@/hooks/user-context'

type UserProviderProps = {
  children: ReactNode
}

function UserProvider({ children }: UserProviderProps) {
  const { data: user, isPending } = useMe()
  const logoutMutation = useLogout()

  return (
    <UserContext.Provider
      value={{
        user: user ?? null,
        isLoading: isPending,
        logout: logoutMutation,
      }}
    >
      {isPending ? (
        <div className="flex h-dvh w-full items-center justify-center">
          Loading user data...
        </div>
      ) : (
        children
      )}
    </UserContext.Provider>
  )
}

export default UserProvider
