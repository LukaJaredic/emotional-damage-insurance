import * as React from 'react'

type ListItemWithOptionalId = {
  id?: React.Key
}

// Virtualized or static list props
type BaseListProps<T> = {
  items: T[]
  itemContent: (index: number, item: T) => React.ReactNode
  isLoading?: boolean
  className?: string
  onEndReached?: (lastIndex: number) => void
}

type ListProps<T> = BaseListProps<T> & {
  virtualized?: boolean
}

export type { BaseListProps, ListItemWithOptionalId, ListProps }
