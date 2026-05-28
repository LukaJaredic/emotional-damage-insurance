import { PencilIcon, TrashIcon } from '@phosphor-icons/react'

import { PageLayout } from '@/components/layout'
import { QueryError, QueryLoading } from '@/components/ui'
import Button from '@/components/ui/shadcn/button'
import { useUserDetail } from '@/features/users/api/get-user'
import { stringifyRoles } from '@features/users/utils/user-labels'

import UserFormDialog from '../form/user-form-dialog'

import { UserActivity } from './user-activity'
import { UserBaseInfo } from './user-base-info'
import UserDeleteDialog from './user-delete-dialog'

type UserDetailProps = {
  userId: string
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
      description={stringifyRoles(user.roles)}
      actions={() => (
        <>
          <UserFormDialog user={user}>
            <Button>
              <PencilIcon /> Edit this user
            </Button>
          </UserFormDialog>
          <UserDeleteDialog user={user}>
            <Button variant="destructive">
              <TrashIcon />
              Delete this user
            </Button>
          </UserDeleteDialog>
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
