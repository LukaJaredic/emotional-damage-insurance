import { debounce } from 'lodash'
import { useState } from 'react'
import type { InputActionMeta } from 'react-select'

import type { RemoteDataState } from '@/components/data/remote-data'

import Select from './select'
import type { SelectOption, SelectProps } from './select'

const SEARCH_DEBOUNCE_MS = 300

type RemoteSelectQuery = {
  search?: string
}

type RemoteSelectProps<
  TItem extends Record<string, unknown>,
  TQuery extends RemoteSelectQuery = RemoteSelectQuery,
> = Omit<
  Extract<SelectProps, { isMultiple?: false }>,
  | 'options'
  | 'isMultiple'
  | 'isLoading'
  | 'onInputChange'
  | 'onMenuScrollToBottom'
> & {
  useRemoteData: (params: TQuery) => RemoteDataState<TItem>
  renderOption: (item: TItem) => SelectOption
  params?: Omit<TQuery, keyof RemoteSelectQuery>
}

function buildOptions<TItem extends Record<string, unknown>>(
  items: TItem[],
  renderOption: (item: TItem) => SelectOption,
  selectedOption: SelectOption | null,
  value: string | undefined,
) {
  const options = items.map(renderOption)

  if (
    !selectedOption ||
    selectedOption.value !== value ||
    options.some((option) => option.value === selectedOption.value)
  ) {
    return options
  }

  return [selectedOption, ...options]
}

/**
 * Renders a single-value select whose options are loaded by a remote-data hook.
 * Typing in the select updates the hook's `search` param.
 *
 * @param useRemoteData - A TenStack hook that fetches remote data based on the provided query parameters.
 * @param renderOption - A function that maps each item returned by the remote data hook to a SelectOption.
 * @param params - Additional query parameters (search param is already included) to pass to the remote data hook.
 * @param value - The currently selected value of the select.
 * @param onChange - A callback function that is called when the selected value changes.
 * @param noOptionsMessage - A message to display when there are no options available.
 * @param props - Additional props to pass to the Select component.
 */
function RemoteSelect<
  TItem extends Record<string, unknown>,
  TQuery extends RemoteSelectQuery = RemoteSelectQuery,
>({
  useRemoteData,
  renderOption,
  params,
  value,
  onChange,
  noOptionsMessage = 'No options found',
  ...props
}: RemoteSelectProps<TItem, TQuery>) {
  const [search, setSearch] = useState('')
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    null,
  )
  const debouncedSetSearch = debounce(setSearch, SEARCH_DEBOUNCE_MS)

  const [initialUseRemoteData] = useState(() => useRemoteData)
  if (import.meta.env.DEV && initialUseRemoteData !== useRemoteData) {
    throw new Error(
      'RemoteSelect received a different useRemoteData hook between renders. This breaks the rules of hooks. Pass a stable hook reference.',
    )
  }

  const query = useRemoteData({
    ...(params ?? {}),
    ...(search ? { search } : {}),
  } as TQuery)
  const options = buildOptions(query.items, renderOption, selectedOption, value)

  function handleInputChange(nextValue: string, actionMeta: InputActionMeta) {
    if (actionMeta.action === 'input-change') {
      debouncedSetSearch(nextValue)
    }
  }

  function handleMenuScrollToBottom() {
    if (!query.hasNextPage || query.isFetchingMore) {
      return
    }

    void query.fetchNextPage?.()
  }

  function handleChange(nextValue: string) {
    setSelectedOption(
      options.find((option) => option.value === nextValue) ?? null,
    )
    onChange(nextValue)
  }

  return (
    <Select
      {...props}
      isMultiple={false}
      value={value ?? ''}
      onChange={handleChange}
      options={options}
      noOptionsMessage={
        query.isError ? 'Could not load options' : noOptionsMessage
      }
      isLoading={query.isInitialLoading || query.isFetchingMore}
      onInputChange={handleInputChange}
      onMenuScrollToBottom={handleMenuScrollToBottom}
    />
  )
}

export default RemoteSelect
export type { RemoteSelectProps, RemoteSelectQuery }
