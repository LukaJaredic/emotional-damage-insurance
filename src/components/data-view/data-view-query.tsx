import DataView from './data-view'
import type { DataViewQueryProps } from './data-view-query.types'

function DataViewQuery<T extends Record<string, unknown>>({
  query,
  ...props
}: DataViewQueryProps<T>) {
  const {
    items,
    isInitialLoading,
    isFetchingMore,
    hasNextPage,
    fetchNextPage,
  } = query

  function handleEndReached() {
    if (!hasNextPage || isInitialLoading || isFetchingMore || !fetchNextPage) {
      return
    }

    void fetchNextPage()
  }

  return (
    <DataView
      {...props}
      items={items}
      isLoading={items.length === 0 ? isInitialLoading : isFetchingMore}
      onEndReached={handleEndReached}
    />
  )
}

export default DataViewQuery
