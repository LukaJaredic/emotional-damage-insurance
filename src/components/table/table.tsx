import { cn } from '@/lib/utils'

import StaticTable from './static-table'
import type { TableProps } from './table.types'
import VirtualizedTable from './virtualized-table'

function Table<T extends Record<string, unknown>>({
  virtualized = false,
  className,
  ...props
}: TableProps<T>) {
  const sharedClassName = cn('h-full min-h-0', className)

  if (virtualized) {
    return <VirtualizedTable {...props} className={sharedClassName} />
  }

  return <StaticTable {...props} className={sharedClassName} />
}

export default Table
