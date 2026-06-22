import { useUser } from '@/hooks'
import { PermissionsContext } from '@/hooks/permissions-context'
import { buildPermissionsFor } from '@/utils'

type PermissionsProviderProps = {
  children: React.ReactNode
}

function PermissionsProvider({ children }: PermissionsProviderProps) {
  const { user } = useUser()

  return (
    <PermissionsContext.Provider value={buildPermissionsFor(user)}>
      {children}
    </PermissionsContext.Provider>
  )
}

export default PermissionsProvider
