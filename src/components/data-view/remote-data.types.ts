import type { DataViewProps } from './data-view.types'

type RemoteDataState<T> = {
  items: T[]
  isInitialLoading: boolean
  isFetchingMore: boolean
  hasNextPage: boolean
  fetchNextPage?: () => Promise<unknown> | void
}

type RemoteDataProps<T extends Record<string, unknown>> = Omit<
  DataViewProps<T>,
  'items' | 'isLoading' | 'onEndReached'
> & {
  query: RemoteDataState<T>
}

export type { RemoteDataProps, RemoteDataState }
