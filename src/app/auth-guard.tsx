import { Navigate } from 'react-router-dom'

import { paths } from '@/config/paths'
import { useUser } from '@/hooks/use-user'

type AuthGuardProps = {
  children: React.ReactNode
}

function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useUser()

  if (!user && !isLoading)
    return <Navigate to={paths.auth.login.getHref(window.location.pathname)} />

  return children
}

export default AuthGuard
