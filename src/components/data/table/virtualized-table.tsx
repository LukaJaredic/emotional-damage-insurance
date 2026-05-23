import { forwardRef, type ComponentProps } from 'react'
import { TableVirtuoso, type TableComponents } from 'react-virtuoso'

import { cn } from '@/lib/utils'
import {
  Table as UITable,
  TableBody as UITableBody,
  TableCaption as UITableCaption,
  TableHeader as UITableHeader,
  TableRow as UITableRow,
} from '@components/ui/shadcn/table'

import { LoadingRow, TableHeaderRow, TableRowCells } from './table.components'
import type { BaseTableProps } from './table.types'
import { useExpandedColumns, sharedTableClassName } from './table.utils'

type TableContext = {
  caption: string
  isLoading: boolean
  rowCount: number
}

const VirtuosoTableHead = forwardRef<
  HTMLTableSectionElement,
  ComponentProps<'thead'> & { context?: TableContext }
>(({ children, style, context }, ref) => {
  void context

  return (
    <UITableHeader ref={ref} style={style}>
      {children}
    </UITableHeader>
  )
})

VirtuosoTableHead.displayName = 'VirtuosoTableHead'

const VirtuosoTableBody = forwardRef<
  HTMLTableSectionElement,
  ComponentProps<'tbody'> & { context?: TableContext }
>(({ children, className, style, context, ...props }, ref) => {
  void context

  return (
    <UITableBody ref={ref} className={className} style={style} {...props}>
      {children}
    </UITableBody>
  )
})

VirtuosoTableBody.displayName = 'VirtuosoTableBody'

const virtuosoTableComponents: TableComponents<unknown, TableContext> = {
  Table: ({ children, style, context }) => (
    <UITable
      aria-busy={context.isLoading}
      aria-rowcount={context.rowCount}
      className="w-max min-w-full"
      style={style}
    >
      <UITableCaption className="sr-only">{context.caption}</UITableCaption>
      {children}
    </UITable>
  ),
  TableHead: VirtuosoTableHead,
  TableBody: VirtuosoTableBody,
  TableRow: ({ children, item, context, ...props }) => {
    void item
    void context

    return (
      <UITableRow aria-rowindex={props['data-index'] + 1} {...props}>
        {children}
      </UITableRow>
    )
  },
}

function VirtualizedTable<T extends Record<string, unknown>>({
  caption,
  rows,
  columns,
  isLoading = false,
  className,
  onEndReached = (lastIndex) => void lastIndex,
}: BaseTableProps<T>) {
  const { isColumnExpanded, toggleExpandedColumn } = useExpandedColumns()

  return (
    <div
      className={cn(
        sharedTableClassName,
        'overflow-x-auto overflow-y-hidden',
        className,
      )}
    >
      <TableVirtuoso
        context={{ caption, isLoading, rowCount: rows.length }}
        data={rows}
        totalCount={rows.length}
        style={{ height: '100%' }}
        endReached={onEndReached}
        components={virtuosoTableComponents}
        fixedFooterContent={() => {
          if (!isLoading) {
            return null
          }

          return <LoadingRow colSpan={columns.length} />
        }}
        fixedHeaderContent={() => (
          <TableHeaderRow
            columns={columns}
            isColumnExpanded={isColumnExpanded}
            toggleExpandedColumn={toggleExpandedColumn}
          />
        )}
        itemContent={(_, row) => (
          <TableRowCells
            row={row as T}
            columns={columns}
            isColumnExpanded={isColumnExpanded}
          />
        )}
      />
    </div>
  )
}

export default VirtualizedTable
