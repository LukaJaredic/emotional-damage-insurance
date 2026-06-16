import Spinner from '@/components/ui/spinner'
import { useMediaQuery } from '@/hooks'
import { cn } from '@/lib/utils'

import { List } from '../list'
import { Table } from '../table'

import type { DataViewProps } from './data-view.types'

/**
 * Renders a responsive data view that switches between table (md+) and list (sm) layouts.
 *
 * @param items Items rendered in the current view.
 * @param tableColumns Table columns used on desktop layouts.
 * @param tableCaption Accessible caption for the table layout (only for screen-readers).
 * @param listItemContent Render function used for list items.
 * @param emptyContent Content shown when there are no items.
 * @param loadingContent Content shown while the first page is loading.
 * @param virtualized Whether the underlying table or list should be virtualized.
 * @param isLoading Whether the view is currently loading data.
 * @param className Optional class name applied to the rendered view.
 * @param onEndReached Callback invoked when the end of the data set is reached - called only once per `items.length`.
 */
function DataView<T extends Record<string, unknown>>({
  items,
  tableColumns,
  tableCaption,
  listItemContent,
  emptyContent = 'No items yet',
  loadingContent = 'Loading items...',
  errorContent = 'Something went wrong while loading the data.',
  virtualized = false,
  isLoading = false,
  isError = false,
  className,
  onEndReached = (lastIndex) => void lastIndex,
}: DataViewProps<T>) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const stateClassName = cn(
    'flex h-full w-full items-center justify-center border rounded-xl',
    className,
  )
  const sharedProps = {
    virtualized,
    isLoading,
    isError,
    onEndReached,
    ...(className ? { className } : {}),
  }

  if (items.length === 0 && isLoading) {
    return (
      <div className={stateClassName}>
        <Spinner className="mr-2" />
        <span>{loadingContent}</span>
      </div>
    )
  }

  if (isError) {
    return <div className={stateClassName}>{errorContent}</div>
  }

  if (items.length === 0) {
    return <div className={stateClassName}>{emptyContent}</div>
  }

  if (isDesktop) {
    return (
      <Table
        rows={items}
        columns={tableColumns}
        caption={tableCaption}
        {...sharedProps}
      />
    )
  }

  return <List items={items} itemContent={listItemContent} {...sharedProps} />
}

export default DataView
