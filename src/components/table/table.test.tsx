import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VirtuosoMockContext } from 'react-virtuoso'
import { describe, expect, it, vi } from 'vitest'

import { mockIsIntersecting } from '@/testing/intersection-observer-stub'

import Table from './table'
import type { TableProps, TableColumn } from './table.types'

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

function renderTable(props?: Partial<TableProps<DemoRow>>) {
  const sharedProps = {
    caption: props?.caption ?? 'Clients table',
    rows: props?.rows ?? rows,
    columns: props?.columns ?? columns,
    isLoading: props?.isLoading ?? false,
    virtualized: props?.virtualized ?? false,
    onEndReached: props?.onEndReached ?? ((lastIndex) => void lastIndex),
  }

  return render(
    <div className="h-96">
      <Table {...sharedProps} />
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

function getHeaderToggle(dataIndex: keyof DemoRow) {
  const column = columns.find((item) => item.dataIndex === dataIndex)

  if (!column) {
    throw new Error(`Column with dataIndex "${dataIndex}" not found`)
  }

  return screen.getByRole('button', {
    name: `Expand/Collapse ${column.title} column`,
  })
}

function getHeaderCell(dataIndex: keyof DemoRow) {
  const column = columns.find((item) => item.dataIndex === dataIndex)

  if (!column) {
    throw new Error(`Column with dataIndex "${dataIndex}" not found`)
  }

  return screen.getByRole('columnheader', { name: column.title })
}

function getTableCell(dataIndex: keyof DemoRow, value: string) {
  const column = columns.find((item) => item.dataIndex === dataIndex)

  if (!column) {
    throw new Error(`Column with dataIndex "${dataIndex}" not found`)
  }

  return screen.getByText(value).closest('td')
}

function expectCollapsedColumn(dataIndex: keyof DemoRow, value: string) {
  const headerCell = getHeaderCell(dataIndex)
  const bodyCell = getTableCell(dataIndex, value)

  expect(headerCell).toHaveStyle({
    width: '100px',
    minWidth: '100px',
    maxWidth: '100px',
  })
  expect(bodyCell).toHaveStyle({
    width: '100px',
    minWidth: '100px',
    maxWidth: '100px',
  })
  expect(headerCell.querySelector('span')).toHaveClass('truncate')
  expect(bodyCell?.querySelector('div')).toHaveClass('truncate')
}

function expectExpandedColumn(dataIndex: keyof DemoRow, value: string) {
  const headerCell = getHeaderCell(dataIndex)
  const bodyCell = getTableCell(dataIndex, value)

  expect(headerCell).toHaveStyle({
    width: '300px',
    minWidth: '300px',
    maxWidth: '300px',
  })
  expect(bodyCell).toHaveStyle({
    width: '300px',
    minWidth: '300px',
    maxWidth: '300px',
  })
  expect(headerCell.querySelector('span')).toHaveClass('whitespace-normal')
  expect(bodyCell!.querySelector('div')).toHaveClass('whitespace-normal')
}

function getEndReachedSentinel(container: HTMLElement) {
  const sentinel = container.querySelector('[aria-hidden="true"] > td > div')

  if (!sentinel) {
    throw new Error('Expected end reached sentinel to be rendered')
  }

  return sentinel
}

function createTableSuite(virtualized: boolean) {
  const label = virtualized ? 'Virtualized table' : 'Static table'

  describe(label, () => {
    it('should render default content', () => {
      renderTable({ virtualized })

      expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument()
    })

    it('should render custom content', () => {
      renderTable({ virtualized })

      expect(screen.getByText('User: Jane Doe')).toBeInTheDocument()
    })

    it('should expand a column', async () => {
      renderTable({ virtualized })

      await userEvent.click(getHeaderToggle('email'))

      expectExpandedColumn('email', 'jane.doe@example.com')
    })

    it('should collapse a column', async () => {
      renderTable({ virtualized })

      await userEvent.click(getHeaderToggle('email'))
      await userEvent.click(getHeaderToggle('email'))

      expectCollapsedColumn('email', 'jane.doe@example.com')
    })

    it('should call #onEndReached() once per row count', async () => {
      const onEndReached = vi.fn()
      const nextRows = [
        ...rows,
        { id: '2', name: 'John Doe', email: 'john@example.com' },
      ]

      const rendered = renderTable({ virtualized, onEndReached })

      if (!virtualized) {
        const sentinel = getEndReachedSentinel(rendered.container)

        mockIsIntersecting(sentinel, true)
        mockIsIntersecting(sentinel, true)
      }

      expect(onEndReached).toHaveBeenCalledTimes(1)
      expect(onEndReached).toHaveBeenCalledWith(0)

      rendered.rerender(
        <div className="h-96">
          <Table
            caption="Clients table"
            rows={nextRows}
            columns={columns}
            virtualized={virtualized}
            onEndReached={onEndReached}
          />
        </div>,
      )

      if (!virtualized) {
        mockIsIntersecting(getEndReachedSentinel(rendered.container), true)
      }

      expect(onEndReached).toHaveBeenCalledTimes(2)
      expect(onEndReached).toHaveBeenLastCalledWith(1)
    })

    it('should expose expand/collapse metadata on header toggle', () => {
      renderTable({ virtualized })

      const toggle = getHeaderToggle('email')

      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      expect(toggle).toHaveAttribute('title', 'Expand/Collapse Email column')
    })

    it('should expose sr-only caption on the table', () => {
      renderTable({ virtualized })

      expect(screen.getByText('Clients table')).toHaveClass('sr-only')
    })

    it('should expose loading state', () => {
      renderTable({ virtualized, isLoading: true })

      expect(
        screen.getByRole('table', { name: 'Clients table' }),
      ).toHaveAttribute('aria-busy', 'true')
      expect(screen.getByRole('status')).toHaveTextContent('Loading more rows')
      expect(screen.getByTitle('Loading...')).toBeInTheDocument()
    })
  })
}

createTableSuite(false)
createTableSuite(true)
