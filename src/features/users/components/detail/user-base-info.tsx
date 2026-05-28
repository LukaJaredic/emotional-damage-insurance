import { Avatar, Email } from '@/components/ui'
import type { User } from '@/types'
import { toAppDateTime } from '@/utils'
import { stringifyRoles } from '@features/users/utils/user-labels'

type UserBaseInfoProps = {
  user: User
}

export function UserBaseInfo({ user }: UserBaseInfoProps) {
  return (
    <section className="bg-card basis-1/3 rounded-xl border p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar user={user} />

        <div className="min-w-0">
          <p className="text-foreground text-base font-semibold">
            {user.firstName} {user.lastName}
          </p>
          <Email email={user.email} className="text-sm" />
        </div>
      </div>

      <dl className="mt-6 space-y-4 pt-6">
        <DefinitionListItem term="First name" description={user.firstName} />
        <DefinitionListItem term="Last name" description={user.lastName} />
        <DefinitionListItem
          term="Roles"
          description={stringifyRoles(user.roles)}
        />
        <DefinitionListItem
          term="Email"
          description={
            <Email email={user.email} className="text-sm font-medium" />
          }
        />
        <DefinitionListItem
          term="Created at"
          description={toAppDateTime(user.createdAt)}
        />
      </dl>
    </section>
  )
}

function DefinitionListItem({
  term,
  description,
}: {
  term: string
  description: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 pb-4 text-sm not-last:border-b">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="text-right font-medium">{description}</dd>
    </div>
  )
}
