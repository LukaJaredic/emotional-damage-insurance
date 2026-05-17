import { Navigate } from 'react-router-dom'

import { paths } from '@/config/paths'
import { useUser } from '@/hooks/use-user'

type AuthGuardProps = {
  children: React.ReactNode
  shouldHaveUser?: boolean
}

function AuthGuard({ children, shouldHaveUser = true }: AuthGuardProps) {
  const { user, isLoading } = useUser()

  if (shouldHaveUser && !user && !isLoading)
    return <Navigate to={paths.auth.login.getHref(window.location.pathname)} />

  if (!shouldHaveUser && user && !isLoading)
    return <Navigate to={paths.root.getHref()} replace />

  return children
}

export default AuthGuard
