import { isValidElement, useState } from 'react'

const DEFAULT_COLUMN_WIDTH = 100
const EXPANDED_COLUMN_WIDTH = 300

const sharedTableClassName = 'h-full min-h-0 rounded-xl border'

function renderCellValue(value: unknown) {
  if (isValidElement(value)) {
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

function useExpandedColumns() {
  const [expandedColumns, setExpandedColumns] = useState<Set<number>>(new Set())

  function toggleExpandedColumn(index: number) {
    setExpandedColumns((prev) => {
      const next = new Set(prev)

      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }

      return next
    })
  }

  function isColumnExpanded(index: number) {
    return expandedColumns.has(index)
  }

  return {
    isColumnExpanded,
    toggleExpandedColumn,
  }
}

export {
  sharedTableClassName,
  renderCellValue,
  getColumnWidth,
  useExpandedColumns,
}
