import type { Filter } from '@/components/form'

import { typeOptions } from './policy-holder-options'

type PolicyHolderFiltersValues = {
  search: string
  type: string
}

export const policyHolderFilters = [
  {
    name: 'search',
    type: 'text',
    label: 'Search',
    placeholder: 'Name, email, phone, gov. id',
  },
  {
    name: 'type',
    type: 'select',
    label: 'Type',
    placeholder: 'Choose type',
    isMultiple: false,
    options: typeOptions,
  },
] satisfies Filter<PolicyHolderFiltersValues>[]
