import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VirtuosoMockContext } from 'react-virtuoso'
import { describe, expect, it } from 'vitest'

import Table, { type TableColumn } from './table'

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

function renderTable() {
  return render(
    <div className="h-96">
      <Table rows={rows} columns={columns} />
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

function getHeaderCell(dataIndex: keyof DemoRow) {
  const column = columns.find((col) => col.dataIndex === dataIndex)

  if (!column) {
    throw new Error(`Column with dataIndex "${dataIndex}" not found`)
  }

  return screen.getByRole('columnheader', { name: column.title })
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

    await userEvent.click(getHeaderCell('email'))

    expectCellsToHaveStyle('email', {
      width: '300px',
      minWidth: '300px',
      maxWidth: '300px',
    })

    expectCellsContentToHaveClass('email', 'whitespace-normal')
  })

  it('should collapse a column', async () => {
    renderTable()

    await userEvent.click(getHeaderCell('email'))
    await userEvent.click(getHeaderCell('email'))

    expectCellsToHaveStyle('email', {
      width: '100px',
      minWidth: '100px',
      maxWidth: '100px',
    })

    expectCellsContentToHaveClass('email', 'truncate')
  })
})
