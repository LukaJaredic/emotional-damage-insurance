import { Navigate, useParams } from 'react-router-dom'

import { paths } from '@/config'
import UserDetail from '@/features/users/components/detail/user-detail'

function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()

  if (!userId) {
    return <Navigate to={paths.notFound.getHref()} replace />
  }

  return <UserDetail userId={userId} />
}

export default UserDetailPage
