import * as React from 'react'

type TableColumn<T> = {
  dataIndex: keyof T
  title: string
  render?: (row: T) => React.ReactNode
}

// Virtualized and static table props
type BaseTableProps<T> = {
  caption: string
  rows: T[]
  columns: TableColumn<T>[]
  isLoading?: boolean
  className?: string
  onEndReached?: (lastIndex: number) => void
}

type TableProps<T> = BaseTableProps<T> & {
  virtualized?: boolean
}

export type { BaseTableProps, TableColumn, TableProps }
