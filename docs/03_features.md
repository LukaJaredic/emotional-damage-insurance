# Features

## Main idea

Each feature owns its own UI, API calls, types, and helpers.

Let's take `users` feature as an example.

## Users feature shape

```text
src/features/users/
├── api/
├── components/
│   ├── detail/
│   ├── form/
│   └── master/
├── types/
└── utils/
```

## What goes where

- `api/`: fetchers and TanStack Query hooks
- `components/`: feature UI
- `types/`: form values, actions, and query param types
- `utils/`: schemas, builders, filters, labels, options, columns, and feature query keys

## Example: users

- `components/master/users-master.tsx` is the users list page UI.
- `components/detail/user-detail.tsx` is the user detail page UI.
- `components/form/user-form.tsx` owns the create and edit form.
- `api/get-users.ts` and `api/get-user.ts` fetch server data.
- `api/create-user.ts`, `api/update-user.ts`, and `api/delete-user.ts` handle mutations.
- `utils/user-query-keys.ts` owns users query keys through `userQueryKeys`.

## Keep app routes thin

The app route should usually just read params and render a feature component.

```tsx
import { Navigate, useParams } from 'react-router-dom'

import { paths } from '@/config'
import UserDetail from '@/features/users/components/detail/user-detail'

function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()

  if (!userId) {
    return <Navigate to={paths.notFound.getHref()} replace />
  }

  return <UserDetail userId={userId} />
}
```

Route access belongs in the app router, not inside the feature component.

```tsx
{
  path: paths.users.path,
  element: protectedRoute('users:master-page', <UsersMasterPage />),
}
```

The feature component can still use `can()` for record-level UI, like buttons and form fields.

## Simple build order

1. Define the feature types - Note: Main domain types (eg. `User`) go to `src/types/`. Other feature-specific types (form values, actions, queries...) go in here.
2. Add schemas and builders in `utils/`.
3. Add fetchers and hooks in `api/`.
4. Build the feature components.
5. Add page access in `src/utils/permissions.ts` if the feature has protected pages.
6. Mount the feature from `src/app/routes` with the correct `PageAccess` value.

## Rules

- Keep feature code together.
- Do not import one feature directly into another feature.
- Move code to shared folders only when it is truly reused.
- Keep route access checks in the app layer.

[← Shared Components](./02_shared_components.md) | [Server Communication →](./04_server_communication.md)
