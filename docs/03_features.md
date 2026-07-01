# Features

## Main idea

Each feature owns its own UI, feature-only API calls, types, and helpers.

If API code is reused by shared components or multiple feature areas, move it to `src/api` and export it from the common API barrels.

Let's take `policy-holders` feature as an example.

## Policy Holders feature shape

```text
src/features/policy-holders/
├── api/
├── components/
│   ├── detail/
│   ├── form/
│   └── master/
├── types/
└── utils/
```

## What goes where

- `api/`: fetchers and TanStack Query hooks used only by this feature
- `components/`: feature UI
- `types/`: form values, actions, and query param types
- `utils/`: schemas, builders, filters, labels, options, columns, and feature query keys

## Example: policy holders

- `components/master/policy-holders-master.tsx` is the policy holders list page UI.
- `components/detail/policy-holder-detail.tsx` is the policy holder detail page UI.
- `components/form/policy-holder-form.tsx` owns the create and edit form.
- `api/get-policy-holders.ts` and `api/get-policy-holder.ts` fetch feature data.
- `api/create-policy-holder.ts`, `api/update-policy-holder.ts`, and `api/delete-policy-holder.ts` handle mutations.
- `utils/policy-holder-query-keys.ts` owns policy holder query keys through `policyHolderQueryKeys`.

## Keep app routes thin

The app route should usually just read params and render a feature component.

```tsx
import { Navigate, useParams } from 'react-router-dom'

import { paths } from '@/config'
import PolicyHolderDetail from '@/features/policy-holders/components/detail/policy-holder-detail'

function PolicyHolderDetailPage() {
  const { policyHolderId } = useParams<{ policyHolderId: string }>()

  if (!policyHolderId) {
    return <Navigate to={paths.notFound.getHref()} replace />
  }

  return <PolicyHolderDetail policyHolderId={policyHolderId} />
}
```

Route access belongs in the app router, not inside the feature component.

```tsx
{
  path: paths.policyHolders.path,
  element: protectedRoute(
    'policy-holders:master-page',
    <PolicyHoldersMasterPage />,
  ),
}
```

The feature component can still use `can()` for record-level UI, like buttons and form fields.

## Simple build order

1. Define the feature types - Note: Main domain types (eg. `User`) go to `src/types/`. Other feature-specific types (form values, actions, queries...) go in here.
2. Add schemas and builders in `utils/`.
3. Add feature-only fetchers and hooks in feature `api/`, or shared fetchers/hooks in `src/api` when reused outside the feature.
4. Build the feature components.
5. Add page access in `src/utils/permissions.ts` if the feature has protected pages.
6. Mount the feature from `src/app/routes` with the correct `PageAccess` value.

## Rules

- Keep feature code together.
- Do not import one feature directly into another feature.
- Move code to shared folders only when it is truly reused.
- Do not import feature modules from `src/components`; use `src/api` for shared API dependencies.
- Keep route access checks in the app layer.

[← Shared Components](./02_shared_components.md) | [Server Communication →](./04_server_communication.md)
