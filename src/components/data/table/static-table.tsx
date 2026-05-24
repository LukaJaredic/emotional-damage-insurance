import { useEndReachedObserver } from '@/hooks'
import { cn } from '@/lib'
import {
  Table as UITable,
  TableBody as UITableBody,
  TableCell as UITableCell,
  TableCaption as UITableCaption,
  TableFooter as UITableFooter,
  TableHeader as UITableHeader,
  TableRow as UITableRow,
} from '@components/ui/shadcn/table'

import { LoadingRow, TableHeaderRow, TableRowCells } from './table.components'
import type { BaseTableProps } from './table.types'
import { sharedTableClassName, useExpandedColumns } from './table.utils'

function StaticTable<T extends Record<string, unknown>>({
  caption,
  rows,
  columns,
  isLoading = false,
  className,
  onEndReached = (lastIndex) => void lastIndex,
}: BaseTableProps<T>) {
  const endReachedRef = useEndReachedObserver({
    itemCount: rows.length,
    onEndReached,
  })
  const { isColumnExpanded, toggleExpandedColumn } = useExpandedColumns()

  return (
    <div className={cn(sharedTableClassName, 'overflow-auto', className)}>
      <UITable aria-busy={isLoading} className="relative w-max min-w-full">
        <UITableCaption className="sr-only">{caption}</UITableCaption>
        <UITableHeader className="bg-background sticky top-0 z-20">
          <TableHeaderRow
            columns={columns}
            isColumnExpanded={isColumnExpanded}
            toggleExpandedColumn={toggleExpandedColumn}
          />
        </UITableHeader>
        <UITableBody>
          {rows.map((row, index) => (
            <UITableRow key={String(row.id ?? index)}>
              <TableRowCells
                row={row}
                columns={columns}
                isColumnExpanded={isColumnExpanded}
              />
            </UITableRow>
          ))}
        </UITableBody>
        <UITableFooter>
          <UITableRow aria-hidden="true">
            <UITableCell colSpan={columns.length} className="h-px p-0">
              <div ref={endReachedRef} />
            </UITableCell>
          </UITableRow>
          {isLoading ? <LoadingRow colSpan={columns.length} /> : null}
        </UITableFooter>
      </UITable>
    </div>
  )
}

export default StaticTable
