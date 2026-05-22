import { useState } from 'react'

import { useUsers } from '@/features/users/api/get-users'
import type { User } from '@/types/user'

import DataViewQuery from '../../../components/data-view/data-view-query'
import Select from '../../../components/select'
import type { SelectOption } from '../../../components/select'
import type { TableColumn } from '../../../components/table/table.types'
import Button from '../../../components/ui/button'
import Input from '../../../components/ui/input'

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

function Scrap() {
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['admin'])
  const [virtualized, setVirtualized] = useState(false)
  const usersQuery = useUsers({
    perPage: 10,
    ...(search ? { search } : {}),
  })

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold">Users Data View</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Query-backed responsive data view using TanStack Query. It fetches
          users automatically, loads more on scroll, and falls back to a list on
          smaller screens.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users"
          className="max-w-sm"
        />
        <Button type="button" variant="outline" onClick={() => setSearch('')}>
          Reset search
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setSearch('zzzz-no-results')}
        >
          Show empty state
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-pressed={virtualized}
          onClick={() => setVirtualized((current) => !current)}
        >
          {virtualized ? 'Disable virtualization' : 'Enable virtualization'}
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-medium">Select Preview</h2>
          <p className="text-muted-foreground text-sm">
            Example of the custom select wrapper in single and multi-select
            modes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Single select</p>
            <Select
              options={roleOptions}
              value={selectedRole}
              onChange={setSelectedRole}
              placeholder="Choose one role"
            />
            <p className="text-muted-foreground text-sm">
              Value: {selectedRole || 'None'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Multi select</p>
            <Select
              options={roleOptions}
              value={selectedRoles}
              onChange={setSelectedRoles}
              isMultiple
              placeholder="Choose multiple roles"
            />
            <p className="text-muted-foreground text-sm">
              Value:{' '}
              {selectedRoles.length > 0 ? selectedRoles.join(', ') : 'None'}
            </p>
          </div>
        </div>
      </div>

      <div className="h-128 overflow-hidden">
        <DataViewQuery
          query={usersQuery}
          tableColumns={userColumns}
          tableCaption="Users table"
          virtualized={virtualized}
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
      </div>
    </section>
  )
}

export default Scrap
