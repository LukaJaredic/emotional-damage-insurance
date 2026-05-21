import type { DataViewProps } from './data-view.types'

type DataViewQueryState<T> = {
  items: T[]
  isInitialLoading: boolean
  isFetchingMore: boolean
  hasNextPage: boolean
  fetchNextPage?: () => Promise<unknown> | void
}

type DataViewQueryProps<T extends Record<string, unknown>> = Omit<
  DataViewProps<T>,
  'items' | 'isLoading' | 'onEndReached'
> & {
  query: DataViewQueryState<T>
}

export type { DataViewQueryProps, DataViewQueryState }
