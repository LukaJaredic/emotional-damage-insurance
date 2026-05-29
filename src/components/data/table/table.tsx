import { cn } from '@/lib'

import StaticTable from './static-table'
import type { TableProps } from './table.types'
import VirtualizedTable from './virtualized-table'

/**
 * Renders either a static or virtualized table with shared layout styling.
 *
 * @param virtualized Whether to render the virtualized table variant.
 * @param className Optional class name applied to the rendered table wrapper.
 * @param props Additional table props passed to the selected `<StaticTable>` or `<VirtualizedTable>`.
 */
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
