import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Filter } from '@/components/form'
import { useMediaQuery } from '@/hooks'
import { renderApp } from '@/testing/test-utils'

import type { TableColumn } from '../table'

import RemoteDataWithFilters from './remote-data-with-filters'
import type { RemoteDataState } from './remote-data.types'

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
const mockedUseRemoteData =
  vi.fn<(params: Query) => RemoteDataState<CreativeWork>>()
const alternateUseRemoteData =
  vi.fn<(params: Query) => RemoteDataState<CreativeWork>>()

function buildQueryState(params: Query): RemoteDataState<CreativeWork> {
  void params

  return {
    items: works,
    isInitialLoading: false,
    isFetchingMore: false,
    hasNextPage: false,
    isError: false,
  }
}

async function renderRemoteDataWithFilters(url = '/') {
  const result = await renderApp(
    <div className="h-96">
      <RemoteDataWithFilters
        useRemoteData={mockedUseRemoteData}
        filters={filters}
        tableColumns={tableColumns}
        tableCaption="Creative works table"
        loadingContent="Loading creative works..."
        emptyContent="No creative works found"
        listItemContent={(_, item) => <span>{item.title}</span>}
      />
    </div>,
    { url },
  )

  return { router: result.router, user: userEvent.setup() }
}

function searchInput() {
  return screen.getByPlaceholderText('Search titles') as HTMLInputElement
}

function typeSelect() {
  return screen.getByRole('combobox')
}

describe('RemoteDataWithFilters', () => {
  beforeEach(() => {
    mockedUseMediaQuery.mockReturnValue(false)
    mockedUseRemoteData.mockImplementation(buildQueryState)
    alternateUseRemoteData.mockImplementation(buildQueryState)
  })

  it('should render default filters and data', async () => {
    await renderRemoteDataWithFilters()

    expect(searchInput()).toHaveValue('')
    expect(screen.getByText('Choose type')).toBeInTheDocument()

    for (const demo of works) {
      expect(screen.getByText(demo.title)).toBeInTheDocument()
    }

    expect(mockedUseRemoteData).toHaveBeenLastCalledWith({
      search: '',
      type: '',
    })
  })

  it('should pre-fill data using search', async () => {
    await renderRemoteDataWithFilters(
      '/?search=batman&type=movie&foo=bar&page=99',
    )

    expect(searchInput()).toHaveValue('batman')
    expect(screen.getByText('Movie')).toBeInTheDocument()

    expect(mockedUseRemoteData).toHaveBeenLastCalledWith({
      search: 'batman',
      type: 'movie',
    })
  })

  it('should set search params when filters change', async () => {
    const { router, user } = await renderRemoteDataWithFilters('/?foo=bar')

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
    const { user } = await renderRemoteDataWithFilters()

    mockedUseRemoteData.mockClear()

    await user.type(searchInput(), 'batman')
    await user.click(typeSelect())
    await user.click(await screen.findByText('Movie'))

    await waitFor(() => {
      expect(mockedUseRemoteData).toHaveBeenLastCalledWith({
        search: 'batman',
        type: 'movie',
      })
    })
  })

  it('should throw when the query hook changes identity', async () => {
    // MemoryRouter is used because we have useSearchParams inside
    const { rerender } = render(
      <MemoryRouter>
        <div className="h-96">
          <RemoteDataWithFilters
            useRemoteData={mockedUseRemoteData}
            filters={filters}
            tableColumns={tableColumns}
            tableCaption="Creative works table"
            loadingContent="Loading creative works..."
            emptyContent="No creative works found"
            listItemContent={(_, item) => <span>{item.title}</span>}
          />
        </div>
      </MemoryRouter>,
    )

    expect(() => {
      rerender(
        <MemoryRouter>
          <div className="h-96">
            <RemoteDataWithFilters
              useRemoteData={alternateUseRemoteData}
              filters={filters}
              tableColumns={tableColumns}
              tableCaption="Creative works table"
              loadingContent="Loading creative works..."
              emptyContent="No creative works found"
              listItemContent={(_, item) => <span>{item.title}</span>}
            />
          </div>
        </MemoryRouter>,
      )
    }).toThrow(
      'RemoteDataWithFilters received a different useRemoteData hook between renders. Pass a stable hook reference.',
    )
  })
})
