import useMediaQuery from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

import List from '../list/list'
import Spinner from '../spinner'
import Table from '../table/table'

import type { DataViewProps } from './data-view.types'

function DataView<T extends Record<string, unknown>>({
  items,
  tableColumns,
  tableCaption,
  listItemContent,
  emptyContent = 'No items yet',
  loadingContent = 'Loading items...',
  virtualized = false,
  isLoading = false,
  className,
  onEndReached = (lastIndex) => void lastIndex,
}: DataViewProps<T>) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const stateClassName = cn(
    'flex h-full w-full items-center justify-center',
    className,
  )
  const sharedProps = {
    virtualized,
    isLoading,
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
