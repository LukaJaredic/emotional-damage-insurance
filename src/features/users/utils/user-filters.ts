import type { Filter, SelectOption } from '@/components/form'

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

export const userFilters = [
  {
    name: 'search',
    type: 'text',
    label: 'Search',
    placeholder: 'Search by name or email',
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
