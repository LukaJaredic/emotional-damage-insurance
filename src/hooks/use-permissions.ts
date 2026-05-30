import { useContext } from 'react'

import { PermissionsContext } from '@/app/providers/permissions-context'

function usePermissions() {
  const context = useContext(PermissionsContext)

  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }

  return context
}

export default usePermissions
