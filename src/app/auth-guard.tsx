import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { paths } from '@/config'
import { usePermissions, useUser } from '@/hooks'
import type { PageAccess } from '@/utils'

type AuthGuardProps = {
  children: ReactNode
  page?: PageAccess
  shouldHaveUser?: boolean
}

function AuthGuard({ children, page, shouldHaveUser = true }: AuthGuardProps) {
  const { user, isLoading } = useUser()
  const { canAccess } = usePermissions()

  if (!shouldHaveUser && user && !isLoading) {
    return <Navigate to={paths.root.getHref()} replace />
  }

  if (shouldHaveUser) {
    if (!user && !isLoading) {
      return (
        <Navigate to={paths.auth.login.getHref(window.location.pathname)} />
      )
    }

    if (page && !canAccess(page)) {
      return <Navigate to={paths.notFound.getHref()} replace />
    }
  }

  return children
}

export default AuthGuard
