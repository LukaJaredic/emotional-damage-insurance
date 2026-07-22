import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { paths } from '@/config'
import type { User } from '@/types'
import { userRoles } from '@/utils'

type UserCardProps = {
  user: User
  action?: ReactNode
}

function UserCard({ user, action }: UserCardProps) {
  const href = paths.users.detail.getHref(user.id)

  if (action) {
    return (
      <article className="hover:bg-accent block rounded-xl border p-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0">{action}</div>
          <Link to={href} className="min-w-0 flex-1">
            <UserCardContent user={user} />
          </Link>
        </div>
      </article>
    )
  }

  return (
    <Link to={href} className="hover:bg-accent block rounded-xl border p-4">
      <UserCardContent user={user} />
    </Link>
  )
}

type UserCardContentProps = {
  user: User
}

function UserCardContent({ user }: UserCardContentProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <h2 className="truncate font-medium">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-muted-foreground truncate text-sm">{user.email}</p>
      </div>
      <p className="text-muted-foreground text-xs uppercase">
        {userRoles(user.roles)}
      </p>
    </div>
  )
}

export default UserCard
export type { UserCardProps }
