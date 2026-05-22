import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import useMediaQuery from '@/hooks/use-media-query'

import type { TableColumn } from '../table/table.types'

import DataViewQueryWithFilters from './data-view-query-with-filters'
import type { DataViewQueryState } from './data-view-query.types'
import type { Filter } from './filters'

vi.mock('@/hooks/use-media-query', () => ({
  default: vi.fn(),
}))

type CreativeWork = {
  title: string
  type: 'movie' | 'show'
}

type Query = {
  search: string
  type: string
}

const works: CreativeWork[] = [
  { title: 'Breaking Bad', type: 'show' },
  { title: 'Better Call Saul', type: 'show' },
  { title: 'The Batman', type: 'movie' },
  { title: 'Batman Begins', type: 'movie' },
  { title: 'Planet Earth', type: 'show' },
]

const filters = [
  {
    name: 'search',
    type: 'text',
    label: 'Search',
    placeholder: 'Search titles',
  },
  {
    name: 'type',
    type: 'select',
    label: 'Type',
    placeholder: 'Choose type',
    options: [
      { label: 'Movie', value: 'movie' },
      { label: 'Show', value: 'show' },
    ],
  },
] satisfies Filter<Query>[]

const tableColumns: TableColumn<CreativeWork>[] = [
  {
    dataIndex: 'title',
    title: 'Title',
  },
  {
    dataIndex: 'type',
    title: 'Type',
  },
]

const mockedUseMediaQuery = vi.mocked(useMediaQuery)
const mockedUseQuery =
  vi.fn<(params: Query) => DataViewQueryState<CreativeWork>>()

function buildQueryState(params: Query): DataViewQueryState<CreativeWork> {
  void params

  return {
    items: works,
    isInitialLoading: false,
    isFetchingMore: false,
    hasNextPage: false,
  }
}

function renderDataViewQueryWithFilters(url = '/') {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <div className="h-96">
            <DataViewQueryWithFilters
              useQuery={mockedUseQuery}
              filters={filters}
              tableColumns={tableColumns}
              tableCaption="Creative works table"
              loadingContent="Loading creative works..."
              emptyContent="No creative works found"
              listItemContent={(_, item) => <span>{item.title}</span>}
            />
          </div>
        ),
      },
    ],
    {
      initialEntries: [url],
    },
  )

  return {
    user: userEvent.setup(),
    router,
    ...render(<RouterProvider router={router} />),
  }
}

function searchInput() {
  return screen.getByPlaceholderText('Search titles') as HTMLInputElement
}

function typeSelect() {
  return screen.getByRole('combobox')
}

describe('DataViewQueryWithFilters', () => {
  beforeEach(() => {
    mockedUseMediaQuery.mockReturnValue(false)
    mockedUseQuery.mockImplementation(buildQueryState)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render default filters and data', () => {
    renderDataViewQueryWithFilters()

    expect(searchInput()).toHaveValue('')
    expect(screen.getByText('Choose type')).toBeInTheDocument()

    for (const demo of works) {
      expect(screen.getByText(demo.title)).toBeInTheDocument()
    }

    expect(mockedUseQuery).toHaveBeenLastCalledWith({
      search: '',
      type: '',
    })
  })

  it('should pre-fill data using search', () => {
    renderDataViewQueryWithFilters('/?search=batman&type=movie&foo=bar&page=99')

    expect(searchInput()).toHaveValue('batman')
    expect(screen.getByText('Movie')).toBeInTheDocument()

    expect(mockedUseQuery).toHaveBeenLastCalledWith({
      search: 'batman',
      type: 'movie',
    })
  })

  it('should set search params when filters change', async () => {
    const { router, user } = renderDataViewQueryWithFilters('/?foo=bar')

    await user.type(searchInput(), 'planet')
    await user.click(typeSelect())
    await user.click(await screen.findByText('Show'))

    await waitFor(() => {
      expect(router.state.location.search).toBe(
        '?foo=bar&search=planet&type=show',
      )
    })
  })

  it('should query data using params', async () => {
    const { user } = renderDataViewQueryWithFilters()

    mockedUseQuery.mockClear()

    await user.type(searchInput(), 'batman')
    await user.click(typeSelect())
    await user.click(await screen.findByText('Movie'))

    await waitFor(() => {
      expect(mockedUseQuery).toHaveBeenLastCalledWith({
        search: 'batman',
        type: 'movie',
      })
    })
  })
})
