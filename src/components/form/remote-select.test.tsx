import { screen, waitFor } from '@testing-library/dom'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import type { RemoteDataState } from '@/components/data/remote-data'

import RemoteSelect from './remote-select'
import type { RemoteSelectQuery } from './remote-select'

type TestItem = {
  id: string
  name: string
}

const items: TestItem[] = [
  {
    id: 'item-1',
    name: 'Emotional damage Insurance',
  },
  {
    id: 'item-2',
    name: 'Property damage Insurance',
  },
]

function buildRemoteDataState<T>(items: T[]): RemoteDataState<T> {
  return {
    items,
    isInitialLoading: false,
    isFetchingMore: false,
    hasNextPage: false,
    isError: false,
  }
}

function getOption(item: TestItem) {
  return {
    label: item.name,
    value: item.id,
  }
}

function renderRemoteSelect({
  useRemoteData,
}: {
  useRemoteData: (params: RemoteSelectQuery) => RemoteDataState<TestItem>
}) {
  function TestRemoteSelect() {
    const [value, setValue] = useState('')

    return (
      <RemoteSelect
        inputId="remote-select"
        placeholder="Search options"
        value={value}
        onChange={setValue}
        useRemoteData={useRemoteData}
        getOption={getOption}
      />
    )
  }

  render(<TestRemoteSelect />)

  return { user: userEvent.setup() }
}

describe('RemoteSelect', () => {
  it('should render the options returned by the remote data hook', async () => {
    const useRemoteData = () => buildRemoteDataState(items)
    const { user } = renderRemoteSelect({ useRemoteData })

    await user.click(screen.getByRole('combobox'))

    expect(
      await screen.findByText('Emotional damage Insurance'),
    ).toBeInTheDocument()

    expect(
      await screen.findByText('Property damage Insurance'),
    ).toBeInTheDocument()
  })

  it('should request remote data with the typed search param', async () => {
    const requests: RemoteSelectQuery[] = []
    const useRemoteData = (params: RemoteSelectQuery) => {
      requests.push(params)

      return buildRemoteDataState(items)
    }
    const { user } = renderRemoteSelect({ useRemoteData })

    await user.type(screen.getByRole('combobox'), 'Emotional damage')

    await waitFor(() => {
      expect(requests).toContainEqual({ search: 'Emotional damage' })
    })
  })
})
