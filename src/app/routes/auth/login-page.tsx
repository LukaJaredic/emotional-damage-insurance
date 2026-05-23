import { useSearchParams } from 'react-router-dom'

import { paths } from '@/config'
import LoginForm from '@/features/auth/components/login-form'

function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? paths.root.getHref()

  return (
    <main className="container mx-auto flex min-h-dvh items-center justify-center">
      <LoginForm redirectTo={redirectTo} />
    </main>
  )
}

export default LoginPage
