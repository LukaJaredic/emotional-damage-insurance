import { useUser } from '@/hooks'
import { buildPermissionsFor } from '@/utils'

import { PermissionsContext } from './permissions-context'

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
