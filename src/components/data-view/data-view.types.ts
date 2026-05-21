import type { ReactNode } from 'react'

import type { TableColumn } from '../table/table.types'

type DataViewProps<T extends Record<string, unknown>> = {
  items: T[]
  tableColumns: TableColumn<T>[]
  listItemContent: (index: number, item: T) => ReactNode
  tableCaption: string
  emptyContent?: ReactNode
  loadingContent?: ReactNode
  virtualized?: boolean
  isLoading?: boolean
  className?: string
  onEndReached?: (lastIndex: number) => void
}

export type { DataViewProps }
