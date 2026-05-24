import { PlusIcon } from '@phosphor-icons/react'

import { RemoteDataWithFilters } from '@/components/data/remote-data'
import { PageLayout } from '@/components/layout'
import Button from '@/components/ui/shadcn/button'
import { useUsers } from '@/features/users/api/get-users'

import { userFilters } from '../utils/user-filters'
import { userColumns } from '../utils/user-table-columns'

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
        listItemContent={(_, user) => (
          <article className="rounded-xl border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-medium">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
              <p className="text-muted-foreground text-xs uppercase">
                {user.roles.join(', ')}
              </p>
            </div>
          </article>
        )}
      />
    </PageLayout>
  )
}

export default UsersMaster
