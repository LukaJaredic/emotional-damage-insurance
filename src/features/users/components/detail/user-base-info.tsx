import { Audit, Avatar, DefinitionTermCard, Email } from '@/components/ui'
import type { User } from '@/types'
import { stringifyRoles } from '@features/users/utils/user-labels'

type UserBaseInfoProps = {
  user: User
}

export function UserBaseInfo({ user }: UserBaseInfoProps) {
  return (
    <DefinitionTermCard
      header={
        <div className="flex items-center gap-4">
          <Avatar user={user} />

          <div className="min-w-0">
            <p className="text-foreground text-base font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <Email email={user.email} className="text-sm" />
          </div>
        </div>
      }
      items={[
        { term: 'First name', definition: user.firstName },
        { term: 'Last name', definition: user.lastName },
        { term: 'Roles', definition: stringifyRoles(user.roles) },
        {
          term: 'Email',
          definition: (
            <Email email={user.email} className="text-sm font-medium" />
          ),
        },
        {
          term: 'Created',
          definition: (
            <Audit userId={user.createdBy} timestamp={user.createdAt} />
          ),
        },
        {
          term: 'Last edited',
          definition: (
            <Audit userId={user.lastEditedBy} timestamp={user.lastEditedAt} />
          ),
        },
      ]}
    />
  )
}
