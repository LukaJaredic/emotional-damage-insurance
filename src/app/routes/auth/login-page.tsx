import { useSearchParams } from 'react-router-dom'

import { paths } from '@/config'
import LoginForm from '@/features/auth/components/login-form'

function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? paths.root.getHref()

  return (
    <main className="animate-page-in container mx-auto flex min-h-dvh items-center justify-center">
      <div className="animate-fade-in-up w-full max-w-md">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </main>
  )
}

export default LoginPage
