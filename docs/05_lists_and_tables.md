# Lists And Tables

## Main pieces

- `RemoteData` takes query state and renders a data view.
- `RemoteDataWithFilters` adds filters from URL search params.
- `DataView` switches between `Table` and `List`.
- `Table` is used on desktop.
- `List` is used on smaller screens.

## Preferred pattern

For list pages, start with `RemoteDataWithFilters` if the page has filters.

The users page is the main example.

```tsx
<RemoteDataWithFilters
  useQuery={useUsers}
  filters={userFilters}
  tableColumns={userColumns}
  tableCaption="Users table"
  loadingContent="Loading users..."
  emptyContent="No users found"
  listItemContent={(_, user) => <UserCard user={user} />}
/>
```

If the page has no filters, use `RemoteData` directly.

## Build columns with `tableColumnBuilder()`

Table columns should always be built with `tableColumnBuilder()` - this way we ensure consistency, DRYness and declarative column definitions.

Do not hand-write raw table column objects in feature code, unless you are completely sure it will never be used in other tables.

```tsx
import { tableColumnBuilder } from '@/components/data/table'
import { paths } from '@/config'
import type { User } from '@/types'

const tcb = tableColumnBuilder<User>()

export const userColumns = [
  tcb.primaryLink({
    title: 'Name',
    dataIndex: 'firstName',
    getHref: (user) => paths.users.detail.getHref(user.id),
    getLabel: (user) => `${user.firstName} ${user.lastName}`,
  }),
  tcb.email('Email', 'email'),
  tcb.array('Roles', 'roles'),
]
```

A special column:

```ts
tcb.primaryLink({
    title: 'Name',
    dataIndex: 'firstName',
    getHref: (user) => paths.users.detail.getHref(user.id),
    getLabel: (user) => `${user.firstName} ${user.lastName}`,
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

That is why the users query returns a `RemoteDataState<User>` instead of returning the raw TanStack Query object.

[← Server Communication](./04_server_communication.md) | [Forms →](./06_forms.md)
