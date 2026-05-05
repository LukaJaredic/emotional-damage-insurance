import { useEffect, useState } from 'react'

import { paths } from '@/config/paths'
import { api } from '@/lib/api'
import type { User } from '@/types/user'
import { UserContext } from '@app/providers/user-context'

type UserProviderProps = {
  children: React.ReactNode
}

function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initUserAndRedirect() {
      const currentPath = window.location.pathname
      const isLoginPage = currentPath === paths.auth.login.path

      try {
        const { data } = await api.get<User>('/auth/me')
        setUser(data)

        if (isLoginPage) window.location.href = paths.root.getHref()
      } catch {
        window.location.href = paths.auth.login.getHref(currentPath)
      } finally {
        setIsLoading(false)
      }
    }

    initUserAndRedirect()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {isLoading ? (
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
