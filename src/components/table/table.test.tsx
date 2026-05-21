import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VirtuosoMockContext } from 'react-virtuoso'
import { describe, expect, it, vi } from 'vitest'

import { mockIsIntersecting } from '@/testing/intersection-observer-stub'

import Table from './table'
import type { TableColumn } from './table.types'

type DemoRow = {
  id: string
  name: string
  email: string
}

const rows: DemoRow[] = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
  },
]

const columns: TableColumn<DemoRow>[] = [
  {
    dataIndex: 'email',
    title: 'Email',
  },
  {
    dataIndex: 'name',
    title: 'Name',
    render: (row) => `User: ${row.name}`,
  },
]

function renderTable(
  props: {
    isLoading?: boolean
    virtualized?: boolean
    onEndReached?: (lastIndex: number) => void
  } = {},
) {
  return render(
    <div className="h-96">
      <Table
        caption="Clients table"
        rows={rows}
        columns={columns}
        isLoading={props.isLoading ?? false}
        virtualized={props.virtualized ?? false}
        onEndReached={props.onEndReached ?? ((lastIndex) => void lastIndex)}
      />
    </div>,
    {
      wrapper: ({ children }) => (
        <VirtuosoMockContext.Provider
          value={{ viewportHeight: 800, itemHeight: 50 }}
        >
          {children}
        </VirtuosoMockContext.Provider>
      ),
    },
  )
}

function getEndReachedSentinel(container: HTMLElement) {
  const sentinel = container.querySelector('[aria-hidden="true"] > td > div')

  if (!sentinel) {
    throw new Error('Expected end reached sentinel to be rendered')
  }

  return sentinel
}

function getHeaderCell(dataIndex: keyof DemoRow) {
  const column = columns.find((col) => col.dataIndex === dataIndex)

  if (!column) {
    throw new Error(`Column with dataIndex "${dataIndex}" not found`)
  }

  return screen.getByRole('columnheader', { name: column.title })
}

function getHeaderToggle(dataIndex: keyof DemoRow) {
  const column = columns.find((col) => col.dataIndex === dataIndex)

  if (!column) {
    throw new Error(`Column with dataIndex "${dataIndex}" not found`)
  }

  return screen.getByRole('button', {
    name: `Expand/Collapse ${column.title} column`,
  })
}

function getTableCell(dataIndex: keyof DemoRow, index = 0) {
  const column = columns.find((col) => col.dataIndex === dataIndex)

  if (!column || index >= rows.length) {
    throw new Error(
      `Column with dataIndex "${dataIndex}" not found or index out of bounds`,
    )
  }

  return screen.getByText(rows[index]![dataIndex]).closest('td')!
}

function expectCellsToHaveStyle(
  dataIndex: keyof DemoRow,
  style: Record<string, string>,
) {
  const headerCell = getHeaderCell(dataIndex)
  const bodyCell = getTableCell(dataIndex)

  expect(headerCell).toHaveStyle(style)
  expect(bodyCell).toHaveStyle(style)
}

function expectCellsContentToHaveClass(
  dataIndex: keyof DemoRow,
  className: string,
) {
  const headerCell = getHeaderCell(dataIndex).querySelector('span')
  const bodyCell = getTableCell(dataIndex).querySelector('div')

  expect(headerCell).toHaveClass(className)
  expect(bodyCell).toHaveClass(className)
}

describe('Table', () => {
  it('should render default column content', async () => {
    renderTable()

    expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument()
  })

  it('should render custom column content', async () => {
    renderTable()

    expect(screen.getByText('User: Jane Doe')).toBeInTheDocument()
  })

  it('should render virtualized column content', async () => {
    renderTable({ virtualized: true })

    expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument()
    expect(screen.getByText('User: Jane Doe')).toBeInTheDocument()
  })

  it('should render collapsed columns', () => {
    renderTable()

    expectCellsToHaveStyle('email', {
      width: '100px',
      minWidth: '100px',
      maxWidth: '100px',
    })

    expectCellsContentToHaveClass('email', 'truncate')
  })

  it('should expand a column', async () => {
    renderTable()

    await userEvent.click(getHeaderToggle('email'))

    expectCellsToHaveStyle('email', {
      width: '300px',
      minWidth: '300px',
      maxWidth: '300px',
    })

    expectCellsContentToHaveClass('email', 'whitespace-normal')
  })

  it('should collapse a column', async () => {
    renderTable()

    await userEvent.click(getHeaderToggle('email'))
    await userEvent.click(getHeaderToggle('email'))

    expectCellsToHaveStyle('email', {
      width: '100px',
      minWidth: '100px',
      maxWidth: '100px',
    })

    expectCellsContentToHaveClass('email', 'truncate')
  })

  it('should expand a virtualized column', async () => {
    renderTable({ virtualized: true })

    await userEvent.click(getHeaderToggle('email'))

    expectCellsToHaveStyle('email', {
      width: '300px',
      minWidth: '300px',
      maxWidth: '300px',
    })

    expectCellsContentToHaveClass('email', 'whitespace-normal')
  })

  it('should call onEndReached in static mode', async () => {
    const onEndReached = vi.fn()
    const rendered = renderTable({ onEndReached })

    mockIsIntersecting(getEndReachedSentinel(rendered.container), true)

    await waitFor(() => {
      expect(onEndReached).toHaveBeenCalledWith(0)
    })
  })

  it('should only call static onEndReached once per row count', () => {
    const onEndReached = vi.fn()
    const rendered = renderTable({ onEndReached })
    const sentinel = getEndReachedSentinel(rendered.container)

    mockIsIntersecting(sentinel, true)
    mockIsIntersecting(sentinel, true)

    expect(onEndReached).toHaveBeenCalledTimes(1)
    expect(onEndReached).toHaveBeenCalledWith(0)
  })

  it('should call onEndReached in virtualized mode', async () => {
    const onEndReached = vi.fn()

    renderTable({ onEndReached, virtualized: true })

    await waitFor(() => {
      expect(onEndReached).toHaveBeenCalledWith(0)
    })
  })

  describe('accessibility', () => {
    it('should expose accessible expand/collapse metadata on header toggle', () => {
      renderTable()

      const toggle = getHeaderToggle('email')

      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      expect(toggle).toHaveAttribute('title', 'Expand/Collapse Email column')
    })

    it('should expose caption on the table', () => {
      renderTable()

      expect(screen.getByText('Clients table')).toHaveClass('sr-only')
    })

    it('should expose loading state and loading footer', () => {
      renderTable({ isLoading: true })

      expect(
        screen.getByRole('table', { name: 'Clients table' }),
      ).toHaveAttribute('aria-busy', 'true')
      expect(screen.getByRole('status')).toHaveTextContent('Loading more rows')
      expect(screen.getByTitle('Loading...')).toBeInTheDocument()
    })

    it('should expose loading state and loading footer in virtualized mode', () => {
      renderTable({ isLoading: true, virtualized: true })

      expect(
        screen.getByRole('table', { name: 'Clients table' }),
      ).toHaveAttribute('aria-busy', 'true')
      expect(screen.getByRole('status')).toHaveTextContent('Loading more rows')
      expect(screen.getByTitle('Loading...')).toBeInTheDocument()
    })
  })
})
