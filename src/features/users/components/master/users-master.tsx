import { PlusIcon } from '@phosphor-icons/react'

import { RemoteDataWithFilters } from '@/components/data/remote-data'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui/shadcn/button'
import { useUsers } from '@/features/users/api/get-users'
import { usePermissions } from '@/hooks'
import { userFilters } from '@features/users/utils/user-filters'
import { userColumns } from '@features/users/utils/user-table-columns'

import UserFormDialog from '../form/user-form-dialog'

import UserCard from './user-card'

function UsersMaster() {
  const { can } = usePermissions()

  return (
    <PageLayout
      heading="Application users"
      description="Browse and filter users that have access to the application."
      actions={() =>
        can('user:create') ? (
          <UserFormDialog>
            <Button>
              <PlusIcon />
              Create a user
            </Button>
          </UserFormDialog>
        ) : null
      }
    >
      <RemoteDataWithFilters
        useRemoteData={useUsers}
        tableColumns={userColumns}
        tableCaption="Users table"
        filters={userFilters}
        emptyContent="No users found."
        loadingContent="Loading users..."
        errorContent="An error occurred while loading users. Please try again."
        listItemContent={(_, user) => <UserCard user={user} />}
      />
    </PageLayout>
  )
}

export default UsersMaster
