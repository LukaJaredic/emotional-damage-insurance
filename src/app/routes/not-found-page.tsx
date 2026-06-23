import Error from '@/components/errors/error'
import { useUser } from '@/hooks'

function NotFoundPage() {
  const { user } = useUser()

  return (
    <Error
      status={404}
      variant="page"
      title="Page Not Found"
      description="We couldn't find what you are looking for"
      actions={user ? 'back-home' : 'back-login'}
    />
  )
}

export default NotFoundPage
