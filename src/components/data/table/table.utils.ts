import { isValidElement, useState } from 'react'

const DEFAULT_COLUMN_WIDTH = 100
const EXPANDED_COLUMN_WIDTH = 300

/**
 * Shared class names used by table wrappers.
 */
const sharedTableClassName = 'h-full min-h-0 rounded-xl border'

/**
 * Renders a table cell value using the shared fallback formatting rules.
 *
 * @param value Value to render inside a table cell.
 * @returns The rendered cell value.
 */
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

/**
 * Returns the width used for a table column based on its expansion state.
 *
 * @param isExpanded Whether the column is currently expanded.
 * @returns The column width in pixels.
 */
function getColumnWidth(isExpanded: boolean) {
  return isExpanded ? EXPANDED_COLUMN_WIDTH : DEFAULT_COLUMN_WIDTH
}

/**
 * Tracks which table columns are currently expanded.
 *
 * @returns Helpers for reading and toggling expanded columns: `#isColumnExpanded(index)` and `toggleExpandedColumn(index)`.
 */
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
