import { DataView } from '../data-view'

import type { RemoteDataProps } from './remote-data.types'

/**
 * Renders a data view backed by a paginated remote-data query state.
 *
 * @param query Remote query state used to render items and load more data.
 * @param props Additional data-view props passed to the underlying `<DataView>`.
 */
function RemoteData<T extends Record<string, unknown>>({
  query,
  ...props
}: RemoteDataProps<T>) {
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

export default RemoteData
