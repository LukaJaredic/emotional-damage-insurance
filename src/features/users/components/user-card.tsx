import { Link } from 'react-router-dom'

import { paths } from '@/config'
import type { User } from '@/types'

type UserCardProps = {
  user: User
}

function UserCard({ user }: UserCardProps) {
  return (
    <Link
      to={paths.users.getDetailHref(user.id)}
      className="hover:bg-accent block rounded-xl border p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-medium">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
        <p className="text-muted-foreground text-xs uppercase">
          {user.roles.join(', ')}
        </p>
      </div>
    </Link>
  )
}

export default UserCard
