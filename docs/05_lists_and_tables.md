# Lists And Tables

## Main pieces

- `RemoteData` takes query state and renders a data view.
- `RemoteDataWithFilters` adds filters from URL search params.
- `DataView` switches between `Table` and `List`.
- `Table` is used on desktop.
- `List` is used on smaller screens.

## Preferred pattern

For list pages, start with `RemoteDataWithFilters` if the page has filters.

The policy-holder and policy pages are the main examples.

```tsx
<RemoteDataWithFilters
  useRemoteData={usePolicyHolders}
  filters={policyHolderFilters}
  tableColumns={policyHolderColumns}
  tableCaption="Policy holders table"
  loadingContent="Loading policy holders..."
  emptyContent="No policy holders found."
  listItemContent={(_, policyHolder) => (
    <PolicyHolderCard policyHolder={policyHolder} />
  )}
/>
```

`useRemoteData` is a hook prop. Pass a stable imported hook reference directly, such as `useRemoteData={usePolicyHolders}`.

Do not pass an inline function or switch hooks conditionally. The hook reference must stay stable between renders.

Filters can use text, select, or date inputs. Filter values are stored in URL search params so pages can be linked and refreshed without losing the current filters.

If the page has no filters, use `RemoteData` directly.

## Build columns with `tableColumnBuilder()`

Build feature table columns with `tableColumnBuilder()` for consistent links, text, email, phone, and custom cells.

```tsx
import { tableColumnBuilder } from '@/components/data/table'
import { paths } from '@/config'
import type { PolicyHolder } from '@/types'

import { policyHolderName, policyHolderTypeLabels } from '@/utils'

const tcb = tableColumnBuilder<PolicyHolder>()

export const policyHolderColumns = [
  tcb.primaryLink({
    title: 'Name',
    dataIndex: 'id',
    getHref: (policyHolder) =>
      paths.policyHolders.detail.getHref(policyHolder.id),
    getLabel: policyHolderName,
  }),
  tcb.custom({
    title: 'Type',
    dataIndex: 'type',
    render: (policyHolder) => policyHolderTypeLabels[policyHolder.type],
  }),
  tcb.text('Government ID', 'governmentId'),
  tcb.email('Email', 'email'),
  tcb.phone('Phone', 'phone'),
]
```

`primaryLink()` makes the row clickable while keeping a real accessible link in the table.

## When to use each piece

- Use `RemoteDataWithFilters` for list pages with filters.
- Use `RemoteData` for list pages without filters.
- Use `DataView` directly only when you already have local items and do not need the remote-data wrapper.
- Use `Table` or `List` directly only when you need lower-level control.

## Query shape for `RemoteData`

Your query object should expose:

- `items`
- `isInitialLoading`
- `isFetchingMore`
- `hasNextPage`
- `fetchNextPage`

That is why the policy holders query returns a `RemoteDataState<PolicyHolder>` instead of returning the raw TanStack Query object.

[← Server Communication](./04_server_communication.md) | [Forms →](./06_forms.md)
