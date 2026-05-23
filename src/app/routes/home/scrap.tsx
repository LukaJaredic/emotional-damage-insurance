import DataViewQueryWithFilters from '@/components/data-view/data-view-query-with-filters'
import MasterPageLayout from '@/components/master-page-layout'
import Button from '@/components/ui/button'
import { useUsers } from '@/features/users/api/get-users'
import type { User } from '@/types/user'

import { type Filter } from '../../../components/data-view/filters'
import type { SelectOption } from '../../../components/select'
import type { TableColumn } from '../../../components/table/table.types'

const userColumns: TableColumn<User>[] = [
  {
    dataIndex: 'email',
    title: 'Email',
  },
  {
    dataIndex: 'firstName',
    title: 'Name',
    render: (user) => `${user.firstName} ${user.lastName}`,
  },
  {
    dataIndex: 'roles',
    title: 'Roles',
    render: (user) => user.roles.join(', '),
  },
]

const roleOptions: SelectOption[] = [
  {
    label: 'Admin',
    value: 'admin',
  },
  {
    label: 'Employee',
    value: 'employee',
  },
  {
    label: 'Customer',
    value: 'customer',
  },
]

type UserFiltersValues = {
  search: string
  roles: string[]
}

const userFilters = [
  {
    name: 'search',
    type: 'text',
    label: 'Search',
    placeholder: 'Search users',
  },
  {
    name: 'roles',
    type: 'select',
    label: 'Roles',
    placeholder: 'Choose roles',
    isMultiple: true,
    options: roleOptions,
  },
] satisfies Filter<UserFiltersValues>[]

function Scrap() {
  return (
    <MasterPageLayout
      heading="Users"
      description="Browse and filter system users."
      actions={
        <>
          <Button className="btn">Create user</Button>
          <Button variant="secondary" className="btn">
            Create user
          </Button>
          <Button variant="destructive" className="btn">
            Create user
          </Button>
        </>
      }
    >
      <DataViewQueryWithFilters
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
    </MasterPageLayout>
  )
}

export default Scrap
