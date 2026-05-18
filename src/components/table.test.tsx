import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import Table, { type TableColumn } from './table'

// Virtualization is unpredictable in tests and makes it hard to assert on the rendered content.
vi.mock('react-virtuoso', () => ({
  TableVirtuoso: ({
    data,
    components,
    fixedHeaderContent,
    itemContent,
    style,
  }: {
    data: unknown[]
    components?: {
      Table?: React.ComponentType<React.ComponentProps<'table'>>
      TableHead?: React.ComponentType<React.ComponentProps<'thead'>>
      TableBody?: React.ComponentType<React.ComponentProps<'tbody'>>
      TableRow?: React.ComponentType<
        React.ComponentProps<'tr'> & {
          item: unknown
          'data-index': number
          'data-item-index': number
          'data-known-size': number
        }
      >
    }
    fixedHeaderContent?: () => React.ReactNode
    itemContent?: (index: number, row: unknown) => React.ReactNode
    style?: React.CSSProperties
  }) => {
    const TableComponent = components?.Table ?? 'table'
    const TableHeadComponent = components?.TableHead ?? 'thead'
    const TableBodyComponent = components?.TableBody ?? 'tbody'
    const TableRowComponent = components?.TableRow ?? 'tr'

    return (
      <div style={style}>
        <TableComponent>
          <TableHeadComponent>{fixedHeaderContent?.()}</TableHeadComponent>
          <TableBodyComponent>
            {data.map((row, index) => (
              <TableRowComponent
                key={index}
                item={row}
                data-index={index}
                data-item-index={index}
                data-known-size={0}
              >
                {itemContent?.(index, row)}
              </TableRowComponent>
            ))}
          </TableBodyComponent>
        </TableComponent>
      </div>
    )
  },
}))

type DemoRow = {
  id: string
  name: string
  email: string
  notes: string
}

const rows: DemoRow[] = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    notes:
      'This is a long note that should truncate by default and wrap when expanded.',
  },
]

const columns: TableColumn<DemoRow>[] = [
  {
    dataIndex: 'name',
    title: 'Name',
    render: (row) => `User: ${row.name}`,
  },
  {
    dataIndex: 'email',
    title: 'Email',
  },
  {
    dataIndex: 'notes',
    title: 'Notes',
  },
]

function renderTable() {
  return render(
    <div className="h-96">
      <Table rows={rows} columns={columns} />
    </div>,
  )
}

function getHeaderCell(name: string) {
  return screen.getByRole('columnheader', { name })
}

describe('Table', () => {
  it('should render default and custom column content', () => {
    renderTable()

    expect(screen.getByText('User: Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This is a long note that should truncate by default and wrap when expanded.',
      ),
    ).toBeInTheDocument()
  })

  it('should render collapsed columns with 100px width and truncated content', () => {
    renderTable()

    const emailHeader = getHeaderCell('Email')
    const emailHeaderLabel = within(emailHeader).getByText('Email')
    const emailCellContent = screen.getByText('jane.doe@example.com')
    const emailCell = emailCellContent.closest('td')

    expect(emailHeader).toHaveStyle({
      width: '100px',
      minWidth: '100px',
      maxWidth: '100px',
    })
    expect(emailCell).toHaveStyle({
      width: '100px',
      minWidth: '100px',
      maxWidth: '100px',
    })
    expect(emailHeaderLabel).toHaveClass('truncate')
    expect(emailCellContent).toHaveClass('truncate')
  })

  it('should expand a column to 300px and allow wrapped content', async () => {
    renderTable()

    const notesHeader = getHeaderCell('Notes')
    const notesHeaderLabel = within(notesHeader).getByText('Notes')
    const notesCellContent = screen.getByText(
      'This is a long note that should truncate by default and wrap when expanded.',
    )
    const notesCell = notesCellContent.closest('td')

    await userEvent.click(notesHeader)

    expect(notesHeader).toHaveStyle({
      width: '300px',
      minWidth: '300px',
      maxWidth: '300px',
    })
    expect(notesCell).toHaveStyle({
      width: '300px',
      minWidth: '300px',
      maxWidth: '300px',
    })
    expect(notesHeaderLabel).toHaveClass('whitespace-normal')
    expect(notesHeaderLabel).not.toHaveClass('truncate')
    expect(notesCellContent).toHaveClass('whitespace-normal')
    expect(notesCellContent).not.toHaveClass('truncate')
  })
})
