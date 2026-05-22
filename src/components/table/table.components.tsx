import {
  ArrowsInLineHorizontalIcon,
  ArrowsOutLineHorizontalIcon,
} from '@phosphor-icons/react'

import { cn } from '@/lib/utils'
import Spinner from '@components/spinner'
import {
  TableCell as UITableCell,
  TableHead as UITableHead,
  TableRow as UITableRow,
} from '@components/ui/table'

import type { TableColumn } from './table.types'
import { getColumnWidth, renderCellValue } from './table.utils'

type TableHeaderRowProps<T> = {
  columns: TableColumn<T>[]
  isColumnExpanded: (index: number) => boolean
  toggleExpandedColumn: (index: number) => void
}

function TableHeaderRow<T>({
  columns,
  isColumnExpanded,
  toggleExpandedColumn,
}: TableHeaderRowProps<T>) {
  return (
    <UITableRow>
      {columns.map((column, index) => {
        const expanded = isColumnExpanded(index)
        const width = getColumnWidth(expanded)
        const expandCollapseLabel = `Expand/Collapse ${column.title} column`

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

type TableRowCellsProps<T> = {
  row: T
  columns: TableColumn<T>[]
  isColumnExpanded: (index: number) => boolean
}

function TableRowCells<T>({
  row,
  columns,
  isColumnExpanded,
}: TableRowCellsProps<T>) {
  return columns.map((column, index) => {
    const expanded = isColumnExpanded(index)
    const width = getColumnWidth(expanded)
    const content = column.render
      ? column.render(row)
      : renderCellValue(row[column.dataIndex])

    return (
      <UITableCell
        key={String(column.dataIndex)}
        className="transition-all duration-300 ease-in-out"
        style={{ width, minWidth: width, maxWidth: width }}
      >
        <div className={cn(expanded ? 'whitespace-normal' : 'truncate')}>
          {content}
        </div>
      </UITableCell>
    )
  })
}

type LoadingRowProps = {
  colSpan: number
  label?: string
}

function LoadingRow({ colSpan, label = 'Loading more rows' }: LoadingRowProps) {
  return (
    <UITableRow className="bg-primary/50 sticky bottom-0">
      <UITableCell colSpan={colSpan} className="p-4 text-center">
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center"
        >
          <span aria-hidden="true">
            <Spinner />
          </span>
          <span className="sr-only">{label}</span>
        </div>
      </UITableCell>
    </UITableRow>
  )
}

export { LoadingRow, TableHeaderRow, TableRowCells }
