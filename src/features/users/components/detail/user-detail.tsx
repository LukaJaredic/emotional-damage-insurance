import { PencilIcon, TrashIcon } from '@phosphor-icons/react'

import { useUserDetail } from '@/api'
import { PageLayout } from '@/components/layout'
import { QueryLoading, Tabs } from '@/components/ui'
import { Button } from '@/components/ui/shadcn/button'
import { usePermissions, useUser } from '@/hooks'
import { userRoles } from '@/utils'

import UserFormDialog from '../form/user-form-dialog'

import { UserBaseInfo } from './user-base-info'
import UserDeleteDialog from './user-delete-dialog'
import UserPolicies from './user-policies'

const USER_DETAIL_TABS_STORAGE_KEY = 'user-detail-tabs'

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
    throw query.error
  }

  const user = query.data
  const isMyProfile = me?.id === user.id

  return (
    <PageLayout
      heading={`${user.firstName} ${user.lastName}`}
      description={userRoles(user.roles)}
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
      <Tabs
        items={[
          {
            value: 'basic-info',
            label: 'Basic info',
            content: <UserBaseInfo user={user} />,
          },
          {
            value: 'coverage-limits',
            label: 'Policies',
            content: <UserPolicies user={user} />,
          },
        ]}
        defaultValue="basic-info"
        storageKey={USER_DETAIL_TABS_STORAGE_KEY}
        ariaLabel="User details"
        className="w-full"
        tabsContentClassName="pt-4"
      />
    </PageLayout>
  )
}

export default UserDetail
