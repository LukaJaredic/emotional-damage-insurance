import type { Filter } from '@/components/form'
import {
  userSearchFilter,
  type UserSearchFilterValues,
} from '@/components/users'

import { roleOptions } from './user-options'

type UserFiltersValues = UserSearchFilterValues & {
  roles: string[]
}

export const userFilters = [
  userSearchFilter,
  {
    name: 'roles',
    type: 'select',
    label: 'Roles',
    placeholder: 'Choose roles',
    isMultiple: true,
    options: roleOptions,
  },
] satisfies Filter<UserFiltersValues>[]
