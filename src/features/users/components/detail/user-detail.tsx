import { PencilIcon } from '@phosphor-icons/react'

import { PageLayout } from '@/components/layout'
import { QueryError, QueryLoading } from '@/components/ui'
import Button from '@/components/ui/shadcn/button'
import { useUserDetail } from '@/features/users/api/get-user'
import type { UserRole } from '@/types'
import { roleLabels } from '@features/users/utils/user-labels'

import UserFormDialog from '../form/user-form-dialog'

import { UserActivity } from './user-activity'
import { UserBaseInfo } from './user-base-info'

type UserDetailProps = {
  userId: string
}

function formatRoles(roles: UserRole[]) {
  return roles.map((role) => roleLabels[role]).join(', ')
}

function UserDetail({ userId }: UserDetailProps) {
  const query = useUserDetail({ userId })

  if (query.isPending) {
    return <QueryLoading label="Loading user details..." />
  }

  if (query.isError) {
    return (
      <QueryError
        title="User not found"
        description="We couldn't load this user right now."
      />
    )
  }

  const user = query.data

  return (
    <PageLayout
      heading={`${user.firstName} ${user.lastName}`}
      description={formatRoles(user.roles)}
      actions={() => (
        <UserFormDialog user={user}>
          <Button>
            <PencilIcon /> Edit this user
          </Button>
        </UserFormDialog>
      )}
    >
      <div className="flex min-h-0 w-full flex-col gap-6 *:last:flex-1 xl:flex-row xl:items-start xl:*:first:basis-125">
        <UserBaseInfo user={user} />
        <UserActivity />
      </div>
    </PageLayout>
  )
}

export default UserDetail
