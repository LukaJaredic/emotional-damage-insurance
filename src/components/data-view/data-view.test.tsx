import { render, screen } from '@testing-library/react'
import { VirtuosoMockContext } from 'react-virtuoso'
import { describe, expect, it, vi } from 'vitest'

import useMediaQuery from '@/hooks/use-media-query'

import DataView from './data-view'
import type { DataViewProps } from './data-view.types'

vi.mock('@/hooks/use-media-query', () => ({
  default: vi.fn(),
}))

type DemoItem = {
  id: string
  name: string
  email: string
}

const items: DemoItem[] = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
  },
]

const tableColumns: DataViewProps<DemoItem>['tableColumns'] = [
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

const mockedUseMediaQuery = vi.mocked(useMediaQuery)

function renderDataView(props?: Partial<DataViewProps<DemoItem>>) {
  return render(
    <div className="h-96">
      <DataView
        items={props?.items ?? items}
        tableColumns={props?.tableColumns ?? tableColumns}
        listItemContent={
          props?.listItemContent ?? ((_, item) => <span>{item.name}</span>)
        }
        tableCaption={props?.tableCaption ?? 'Clients table'}
        virtualized={props?.virtualized ?? false}
        isLoading={props?.isLoading ?? false}
        className={props?.className ?? ''}
        onEndReached={props?.onEndReached ?? ((lastIndex) => void lastIndex)}
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

describe('DataView', () => {
  it('renders table on desktop', () => {
    mockedUseMediaQuery.mockReturnValue(true)

    renderDataView()

    expect(
      screen.getByRole('table', { name: 'Clients table' }),
    ).toBeInTheDocument()
  })

  it('renders list on smaller screens', () => {
    mockedUseMediaQuery.mockReturnValue(false)

    renderDataView()

    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })
})
