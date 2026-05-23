import { useLogout, useMe } from '@/utils'

import { UserContext } from './user-context'

type UserProviderProps = {
  children: React.ReactNode
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
