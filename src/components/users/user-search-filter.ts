import type { Filter } from '@/components/form'

export type UserSearchFilterValues = {
  search: string
}

export const userSearchFilter = {
  name: 'search',
  type: 'text',
  label: 'Search',
  placeholder: 'Search by name or email',
} satisfies Filter<UserSearchFilterValues>
