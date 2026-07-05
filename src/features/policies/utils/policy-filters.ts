import type { Filter } from '@/components/form'

type PolicyFiltersValues = {
  search: string
  terminated: string
  startAfterDate: string
  endBeforeDate: string
}

export const policyFilters = [
  {
    name: 'search',
    type: 'text',
    label: 'Search',
    placeholder: 'Search by policy name',
  },
  {
    name: 'terminated',
    type: 'select',
    label: 'Terminated',
    placeholder: 'Is terminated?',
    isMultiple: false,
    options: [
      { label: 'No', value: 'false' },
      { label: 'Yes', value: 'true' },
    ],
  },
  {
    name: 'startAfterDate',
    type: 'date',
    label: 'Starts after',
    placeholder: 'Start date',
  },
  {
    name: 'endBeforeDate',
    type: 'date',
    label: 'Ends before',
    placeholder: 'End date',
  },
] satisfies Filter<PolicyFiltersValues>[]
