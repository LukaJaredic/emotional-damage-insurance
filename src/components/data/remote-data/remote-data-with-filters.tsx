import { useState } from 'react'
import type { DefaultValues, FieldValues } from 'react-hook-form'
import { useSearchParams } from 'react-router'

import { Filters, type Filter } from '@/components/form'
import { cn } from '@/lib'

import RemoteData from './remote-data'
import type { RemoteDataWithFiltersProps } from './remote-data.types'

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

/**
 * Renders a filterable remote-data view synchronized with the URL search params.
 *
 * @param useRemoteData TenStack Query Hook used to fetch filtered remote data.
 * @param filters Filter definitions rendered above the data view.
 * @param className Optional class name applied to the outer layout.
 * @param props Additional remote-data props passed to the underlying `<RemoteData>`.
 */
function RemoteDataWithFilters<
  TItem extends Record<string, unknown>,
  TFilters extends FieldValues,
>({
  useRemoteData,
  filters,
  className,
  ...props
}: RemoteDataWithFiltersProps<TItem, TFilters>) {
  const [searchParams, setSearchParams] = useSearchParams()
  const filterValues = buildFilterValues(searchParams, filters)

  const [initialUseRemoteData] = useState(() => useRemoteData)
  if (import.meta.env.DEV && initialUseRemoteData !== useRemoteData) {
    throw new Error(
      'RemoteDataWithFilters received a different useRemoteData hook between renders. This breaks the rules of hooks. Pass a stable hook reference.',
    )
  }

  const query = useRemoteData(filterValues)

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
        <RemoteData {...props} query={query} />
      </div>
    </div>
  )
}

export default RemoteDataWithFilters
