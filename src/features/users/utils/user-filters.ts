import type { Filter } from '@/components/form'

import { roleOptions } from './user-options'

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
