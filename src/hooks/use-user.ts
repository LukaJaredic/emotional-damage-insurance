import { useContext } from 'react'

import { UserContext } from '@app/providers/user-context'

/**
 * Returns the current user context.
 *
 * @returns The current user context value.
 */
function useUser() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}

export default useUser
