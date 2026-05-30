import { PlusIcon } from '@phosphor-icons/react'

import { RemoteDataWithFilters } from '@/components/data/remote-data'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui/shadcn/button'
import { useUsers } from '@/features/users/api/get-users'
import { userFilters } from '@features/users/utils/user-filters'
import { userColumns } from '@features/users/utils/user-table-columns'

import UserFormDialog from '../form/user-form-dialog'

import UserCard from './user-card'

function UsersMaster() {
  return (
    <PageLayout
      heading="Application users"
      description="Browse and filter users that have access to the application."
      actions={() => (
        <UserFormDialog>
          <Button className="btn">
            <PlusIcon />
            Create a user
          </Button>
        </UserFormDialog>
      )}
    >
      <RemoteDataWithFilters
        useQuery={useUsers}
        tableColumns={userColumns}
        tableCaption="Users table"
        filters={userFilters}
        loadingContent="Loading users..."
        emptyContent="No users found"
        listItemContent={(_, user) => <UserCard user={user} />}
      />
    </PageLayout>
  )
}

export default UsersMaster
