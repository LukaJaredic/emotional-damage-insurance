import type { Key, ReactNode } from 'react'

type ListItemWithOptionalId = {
  id?: Key
}

// Virtualized or static list props
type BaseListProps<T> = {
  items: T[]
  itemContent: (index: number, item: T) => ReactNode
  isLoading?: boolean
  className?: string
  onEndReached?: (lastIndex: number) => void
}

type ListProps<T> = BaseListProps<T> & {
  virtualized?: boolean
}

export type { BaseListProps, ListItemWithOptionalId, ListProps }
