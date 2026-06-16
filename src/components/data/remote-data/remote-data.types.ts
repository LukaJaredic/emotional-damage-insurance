import type { FieldValues } from 'react-hook-form'

import type { Filter } from '@/components/form/filters'

import type { DataViewProps } from '../data-view'

type RemoteDataState<T> = {
  items: T[]
  isInitialLoading: boolean
  isFetchingMore: boolean
  hasNextPage: boolean
  fetchNextPage?: () => Promise<unknown> | void
  isError: boolean
}

type RemoteDataProps<T extends Record<string, unknown>> = Omit<
  DataViewProps<T>,
  'items' | 'isLoading' | 'onEndReached'
> & {
  query: RemoteDataState<T>
}

type RemoteDataWithFiltersProps<
  TItem extends Record<string, unknown>,
  TFilters extends FieldValues,
> = Omit<RemoteDataProps<TItem>, 'query'> & {
  useQuery: (params: TFilters) => RemoteDataState<TItem>
  filters: Filter<TFilters>[]
}

export type { RemoteDataProps, RemoteDataState, RemoteDataWithFiltersProps }
