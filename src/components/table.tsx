import {
  ArrowsInLineHorizontalIcon,
  ArrowsOutLineHorizontalIcon,
} from '@phosphor-icons/react'
import * as React from 'react'
import { useState } from 'react'
import { TableVirtuoso, type TableComponents } from 'react-virtuoso'

import { cn } from '@/lib/utils'

import {
  Table as UITable,
  TableBody as UITableBody,
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
  rows: T[]
  columns: TableColumn<T>[]
  className?: string
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
  React.ComponentProps<'thead'>
>(({ children, style }, ref) => (
  <UITableHeader ref={ref} style={style}>
    {children}
  </UITableHeader>
))

VirtuosoTableHead.displayName = 'VirtuosoTableHead'

const VirtuosoTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentProps<'tbody'>
>(({ children, className, style, ...props }, ref) => (
  <UITableBody ref={ref} className={className} style={style} {...props}>
    {children}
  </UITableBody>
))

VirtuosoTableBody.displayName = 'VirtuosoTableBody'

const virtuosoTableComponents: TableComponents<unknown> = {
  Table: ({ children, style }) => (
    <UITable className="w-max min-w-full" style={style}>
      {children}
    </UITable>
  ),
  TableHead: VirtuosoTableHead,
  TableBody: VirtuosoTableBody,
  TableRow: ({ children, item, ...props }) => {
    // don't spread it over the row
    void item

    return <UITableRow {...props}>{children}</UITableRow>
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

        return (
          <UITableHead
            key={String(column.dataIndex)}
            onClick={() => toggleExpandedColumn(index)}
            className={cn(
              'cursor-pointer transition-all duration-300 ease-in-out',
              expanded && 'bg-primary text-foreground whitespace-normal',
            )}
            style={{ width, minWidth: width, maxWidth: width }}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex-1',
                  expanded ? 'whitespace-normal' : 'truncate',
                )}
              >
                {column.title}
              </span>

              {expanded ? (
                <ArrowsInLineHorizontalIcon />
              ) : (
                <ArrowsOutLineHorizontalIcon />
              )}
            </div>
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
        className={cn(
          'transition-all duration-300 ease-in-out',
          expanded && 'whitespace-normal',
        )}
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
  rows,
  columns,
  className,
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
        data={rows}
        style={{ height: '100%' }}
        components={virtuosoTableComponents}
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
