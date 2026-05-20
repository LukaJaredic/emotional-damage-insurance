import {
  ArrowsInLineHorizontalIcon,
  ArrowsOutLineHorizontalIcon,
} from '@phosphor-icons/react'
import * as React from 'react'
import { useState } from 'react'
import { TableVirtuoso, type TableComponents } from 'react-virtuoso'

import { cn } from '@/lib/utils'

import Spinner from './spinner'
import {
  Table as UITable,
  TableBody as UITableBody,
  TableCaption as UITableCaption,
  TableCell as UITableCell,
  TableHead as UITableHead,
  TableHeader as UITableHeader,
  TableRow as UITableRow,
} from './ui/table'

type TableColumn<T> = {
  dataIndex: keyof T
  title: string
  render?: (row: T) => React.ReactNode
}

type TableProps<T> = {
  caption: string
  rows: T[]
  columns: TableColumn<T>[]
  isLoading?: boolean
  className?: string
  onEndReached?: (lastIndex: number) => void
}

type TableContext = {
  caption: string
  isLoading: boolean
  rowCount: number
}

const DEFAULT_COLUMN_WIDTH = 100
const EXPANDED_COLUMN_WIDTH = 300

// Helpers

function renderCellValue(value: unknown) {
  if (React.isValidElement(value)) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return value == null ? '' : String(value)
}

function getColumnWidth(isExpanded: boolean) {
  return isExpanded ? EXPANDED_COLUMN_WIDTH : DEFAULT_COLUMN_WIDTH
}

// Virtuoso components setup

const VirtuosoTableHead = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentProps<'thead'> & { context?: TableContext }
>(({ children, style, context }, ref) => {
  void context

  return (
    <UITableHeader ref={ref} style={style}>
      {children}
    </UITableHeader>
  )
})

VirtuosoTableHead.displayName = 'VirtuosoTableHead'

const VirtuosoTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentProps<'tbody'> & { context?: TableContext }
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
    // don't spread it over the row
    void item
    void context

    return (
      <UITableRow aria-rowindex={props['data-index'] + 1} {...props}>
        {children}
      </UITableRow>
    )
  },
}

// Extracted components

type FixedHeader<T> = {
  columns: TableColumn<T>[]
  isColumnExpanded: (index: number) => boolean
  toggleExpandedColumn: (index: number) => void
}

function FixedHeader<T>({
  columns,
  isColumnExpanded,
  toggleExpandedColumn,
}: FixedHeader<T>) {
  return (
    <UITableRow>
      {columns.map((column, index) => {
        const expanded = isColumnExpanded(index)
        const width = getColumnWidth(expanded)
        const expandCollapseLabel = `Expand/Collapse ${column.title} column`

        // All <th> can expand/collapse, and will control their respective column.
        return (
          <UITableHead
            key={String(column.dataIndex)}
            className={cn(
              'p-0 transition-all duration-300 ease-in-out',
              expanded && 'bg-primary text-foreground',
            )}
            style={{ width, minWidth: width, maxWidth: width }}
          >
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expandCollapseLabel}
              title={expandCollapseLabel}
              onClick={() => toggleExpandedColumn(index)}
              className="focus-visible:ring-ring flex h-full w-full cursor-pointer items-center gap-2 px-4 py-2 text-left outline-none focus-visible:ring-2"
            >
              <span
                className={cn(
                  'flex-1',
                  expanded ? 'whitespace-normal' : 'truncate',
                )}
              >
                {column.title}
              </span>

              {expanded ? (
                <ArrowsInLineHorizontalIcon aria-hidden="true" />
              ) : (
                <ArrowsOutLineHorizontalIcon aria-hidden="true" />
              )}
            </button>
          </UITableHead>
        )
      })}
    </UITableRow>
  )
}

type RowItemsProps<T> = {
  row: T
  columns: TableColumn<T>[]
  isColumnExpanded: (index: number) => boolean
}

function RowItems<T>({ row, columns, isColumnExpanded }: RowItemsProps<T>) {
  return columns.map((column, index) => {
    const expanded = isColumnExpanded(index)
    const width = getColumnWidth(expanded)
    const content = column.render
      ? column.render(row)
      : renderCellValue(row[column.dataIndex])

    return (
      <UITableCell
        key={String(column.dataIndex)}
        className={'transition-all duration-300 ease-in-out'}
        style={{ width, minWidth: width, maxWidth: width }}
      >
        <div className={cn(expanded ? 'whitespace-normal' : 'truncate')}>
          {content}
        </div>
      </UITableCell>
    )
  })
}

// Main component

function Table<T extends Record<string, unknown>>({
  caption,
  rows,
  columns,
  isLoading = false,
  className,
  onEndReached = (lastIndex) => void lastIndex,
}: TableProps<T>) {
  const [expandedColumns, setExpandedColumns] = useState<Set<number>>(new Set())

  function toggleExpandedColumn(index: number) {
    setExpandedColumns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  function isColumnExpanded(index: number) {
    return expandedColumns.has(index)
  }

  return (
    <div
      className={cn(
        'h-full min-h-0 overflow-x-auto overflow-y-hidden rounded-xl border',
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

          return (
            <UITableRow>
              <UITableCell colSpan={columns.length} className="p-4 text-center">
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center justify-center"
                >
                  <span aria-hidden="true">
                    <Spinner />
                  </span>
                  <span className="sr-only">Loading more rows</span>
                </div>
              </UITableCell>
            </UITableRow>
          )
        }}
        fixedHeaderContent={() => (
          <FixedHeader
            columns={columns}
            isColumnExpanded={isColumnExpanded}
            toggleExpandedColumn={toggleExpandedColumn}
          />
        )}
        itemContent={(_, row) => (
          <RowItems
            row={row as T}
            columns={columns}
            isColumnExpanded={isColumnExpanded}
          />
        )}
      />
    </div>
  )
}

export type { TableColumn }
export default Table
