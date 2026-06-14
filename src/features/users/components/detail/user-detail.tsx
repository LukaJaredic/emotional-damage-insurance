import { PencilIcon, TrashIcon } from '@phosphor-icons/react'

import { PageLayout } from '@/components/layout'
import { QueryError, QueryLoading } from '@/components/ui'
import { Button } from '@/components/ui/shadcn/button'
import { useUserDetail } from '@/features/users/api/get-user'
import { usePermissions, useUser } from '@/hooks'
import { stringifyRoles } from '@features/users/utils/user-labels'

import UserFormDialog from '../form/user-form-dialog'

import { UserActivity } from './user-activity'
import { UserBaseInfo } from './user-base-info'
import UserDeleteDialog from './user-delete-dialog'

type UserDetailProps = {
  userId: string
}

function UserDetail({ userId }: UserDetailProps) {
  const { user: me } = useUser()
  const query = useUserDetail({ userId })
  const { can } = usePermissions()

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
  const isMyProfile = me?.id === user.id

  return (
    <PageLayout
      heading={`${user.firstName} ${user.lastName}`}
      description={stringifyRoles(user.roles)}
      actions={() => (
        <>
          {can('user:update', user, '*') ? (
            <UserFormDialog user={user}>
              <Button>
                <PencilIcon /> Edit {isMyProfile ? 'your profile' : 'this user'}
              </Button>
            </UserFormDialog>
          ) : null}
          {can('user:delete', user) ? (
            <UserDeleteDialog user={user}>
              <Button variant="destructive">
                <TrashIcon />
                Delete {isMyProfile ? 'your profile' : 'this user'}
              </Button>
            </UserDeleteDialog>
          ) : null}
        </>
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
