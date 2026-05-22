import type { DefaultValues, FieldValues } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'

import { cn } from '@/lib/utils'

import DataViewQuery from './data-view-query'
import type {
  DataViewQueryProps,
  DataViewQueryState,
} from './data-view-query.types'
import Filters, { type Filter } from './filters'

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

function readFilterValue<T extends FieldValues>(
  searchParams: URLSearchParams,
  filter: Filter<T>,
) {
  if (filter.type === 'select' && filter.isMultiple) {
    return searchParams.getAll(filter.name)
  }

  return searchParams.get(filter.name) ?? ''
}

function buildFilterValues<T extends FieldValues>(
  searchParams: URLSearchParams,
  filters: Filter<T>[],
): T {
  return Object.assign(
    buildDefaultValues(filters),
    Object.fromEntries(
      filters.map((filter) => [
        filter.name,
        readFilterValue(searchParams, filter),
      ]),
    ),
  ) as T
}

function buildNextSearchParams<T extends FieldValues>(
  currentSearchParams: URLSearchParams,
  values: T,
  filters: Filter<T>[],
) {
  const nextSearchParams = new URLSearchParams(currentSearchParams)

  for (const filter of filters) {
    nextSearchParams.delete(filter.name)

    const value = values[filter.name]

    if (Array.isArray(value)) {
      for (const item of value as any[]) {
        if (item) {
          nextSearchParams.append(filter.name, item)
        }
      }

      continue
    }

    if (typeof value === 'string' && value) {
      nextSearchParams.set(filter.name, value)
    }
  }

  return nextSearchParams
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
  const [searchParams, setSearchParams] = useSearchParams()
  const filterValues = buildFilterValues(searchParams, filters)

  const query = useQuery(filterValues)

  function handleFilterChange(values: TFilters) {
    setSearchParams(buildNextSearchParams(searchParams, values, filters), {
      replace: true,
    })
  }

  return (
    <div className={cn(className, 'flex min-h-0 flex-1 flex-col gap-4')}>
      <Filters
        filters={filters}
        defaultValues={filterValues as DefaultValues<TFilters>}
        onChange={handleFilterChange}
      />

      <div className="min-h-0 flex-1">
        <DataViewQuery {...props} query={query} />
      </div>
    </div>
  )
}

export default DataViewQueryWithFilters
export { DataViewQueryWithFilters, type DataViewQueryWithFiltersProps }
