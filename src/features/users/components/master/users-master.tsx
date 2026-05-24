import { PlusIcon } from '@phosphor-icons/react'

import { RemoteDataWithFilters } from '@/components/data/remote-data'
import { PageLayout } from '@/components/layout'
import Button from '@/components/ui/shadcn/button'
import { useUsers } from '@/features/users/api/get-users'
import { userFilters } from '@features/users/utils/user-filters'
import { userColumns } from '@features/users/utils/user-table-columns'

import UserCard from './user-card'

function UsersMaster() {
  return (
    <PageLayout
      heading="Application users"
      description="Browse and filter users that have access to the application."
      actions={() => (
        <Button className="btn">
          <PlusIcon />
          Create a user
        </Button>
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
