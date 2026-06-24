import { use } from 'react'

import { PermissionsContext } from './permissions-context'

function usePermissions() {
  const context = use(PermissionsContext)

  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }

  return context
}

export default usePermissions
