# Lists And Tables

## Main pieces

- `RemoteData` takes query state and renders a data view.
- `RemoteDataWithFilters` adds filters from URL search params.
- `DataView` switches between `Table` and `List`.
- `Table` is used on desktop.
- `List` is used on smaller screens.

## Preferred pattern

For list pages, start with `RemoteDataWithFilters` if the page has filters.

The policy holders page is the main example.

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

Do not pass inline functions or conditionally select between different hooks. `RemoteDataWithFilters` calls this hook during render, so the hook identity must stay stable to preserve React's fixed hook order. In development, the component throws if `useRemoteData` changes between renders.

If the page has no filters, use `RemoteData` directly.

## Build columns with `tableColumnBuilder()`

Table columns should always be built with `tableColumnBuilder()` - this way we ensure consistency, DRYness and declarative column definitions.

Do not hand-write raw table column objects in feature code, unless you are completely sure it will never be used in other tables.

```tsx
import { tableColumnBuilder } from '@/components/data/table'
import { paths } from '@/config'
import type { PolicyHolder } from '@/types'

import { name, typeLabels } from './policy-holder-labels'

const tcb = tableColumnBuilder<PolicyHolder>()

export const policyHolderColumns = [
  tcb.primaryLink({
    title: 'Name',
    dataIndex: 'id',
    getHref: (policyHolder) =>
      paths.policyHolders.detail.getHref(policyHolder.id),
    getLabel: name,
  }),
  tcb.custom({
    title: 'Type',
    dataIndex: 'type',
    render: (policyHolder) => typeLabels[policyHolder.type],
  }),
  tcb.text('Government ID', 'governmentId'),
  tcb.email('Email', 'email'),
  tcb.phone('Phone', 'phone'),
]
```

A special column:

```ts
tcb.primaryLink({
    title: 'Name',
    dataIndex: 'id',
    getHref: (policyHolder) =>
      paths.policyHolders.detail.getHref(policyHolder.id),
    getLabel: name,
  }),
```

will make the whole row clickable using absolute positioning, while keeping the table accessible.

## When to use each piece

- Use `RemoteDataWithFilters` for list pages with filters.
- Use `RemoteData` for list pages without filters.
- Use `DataView` directly only when you already have local items and do not need the remote-data wrapper.
- Use `Table` or `List` directly only when you need lower-level control - you do not wish the app to choose `Table` vs `List` based on viewport width.

## Query shape for `RemoteData`

Your query object should expose:

- `items`
- `isInitialLoading`
- `isFetchingMore`
- `hasNextPage`
- `fetchNextPage`

That is why the policy holders query returns a `RemoteDataState<PolicyHolder>` instead of returning the raw TanStack Query object.

[← Server Communication](./04_server_communication.md) | [Forms →](./06_forms.md)
