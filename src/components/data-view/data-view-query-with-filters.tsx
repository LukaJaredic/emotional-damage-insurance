import { useState } from 'react'
import type { DefaultValues, FieldValues } from 'react-hook-form'

import Filters, { type Filter } from '@/components/filters'
import { cn } from '@/lib/utils'

import DataViewQuery from './data-view-query'
import type {
  DataViewQueryProps,
  DataViewQueryState,
} from './data-view-query.types'

type DataViewQueryWithFiltersProps<
  TItem extends Record<string, unknown>,
  TFilters extends FieldValues,
> = Omit<DataViewQueryProps<TItem>, 'query'> & {
  useQuery: (params: TFilters) => DataViewQueryState<TItem>
  filters: Filter<TFilters>[]
}

function buildDefaultValues<T extends FieldValues>(
  filters: Filter<T>[],
): DefaultValues<T> {
  return Object.fromEntries(
    filters.map((filter) => [
      filter.name,
      filter.type === 'select' && filter.isMultiple ? [] : '',
    ]),
  ) as DefaultValues<T>
}

function DataViewQueryWithFilters<
  TItem extends Record<string, unknown>,
  TFilters extends FieldValues,
>({
  useQuery,
  filters,
  className,
  ...props
}: DataViewQueryWithFiltersProps<TItem, TFilters>) {
  const [filterValues, setFilterValues] = useState<TFilters>(
    () => buildDefaultValues(filters) as TFilters,
  )
  const query = useQuery(filterValues)

  return (
    <div className={cn(className, 'flex min-h-0 flex-1 flex-col gap-4')}>
      <Filters
        filters={filters}
        defaultValues={filterValues as DefaultValues<TFilters>}
        onChange={setFilterValues}
      />

      <div className="min-h-0 flex-1">
        <DataViewQuery {...props} query={query} />
      </div>
    </div>
  )
}

export default DataViewQueryWithFilters
export { DataViewQueryWithFilters, type DataViewQueryWithFiltersProps }
