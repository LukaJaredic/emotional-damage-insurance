import useMediaQuery from '@/hooks/use-media-query'

import List from '../list/list'
import Table from '../table/table'

import type { DataViewProps } from './data-view.types'

function DataView<T extends Record<string, unknown>>({
  items,
  tableColumns,
  tableCaption,
  listItemContent,
  virtualized = false,
  isLoading = false,
  className,
  onEndReached = (lastIndex) => void lastIndex,
}: DataViewProps<T>) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const sharedProps = {
    virtualized,
    isLoading,
    onEndReached,
    ...(className ? { className } : {}),
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
