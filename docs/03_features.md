# Features

## Main Idea

Each feature owns its UI, feature-only API calls, types, and helpers.

```text
src/features/policies/
├── api/         # Policy-only fetchers and hooks
├── components/  # Forms, lists, details, and feature UI
├── types/       # Form and API types
└── utils/       # Schemas, builders, filters, labels, and query keys
```

The implemented features are `auth`, `users`, `policy-holders`, and `policies`.

## Shared Or Feature-Owned

Keep code inside a feature when only that feature uses it. Move it to a shared folder when app-level code, shared UI, or multiple features need it.

The policy-holder APIs show both cases:

- Detail and mutation APIs stay in `src/features/policy-holders/api`.
- The list API lives in `src/api/policy-holders` because policy holders and policies both use it.
- Its shared query keys live in `src/config/query-keys.ts`.

Features must not import from other features. Promote shared code instead.

## Shared Domain Types

Persisted domain objects such as `User`, `PolicyHolder`, and `Policy` live in `src/types`. Feature-only form and query types stay in their feature.

## Keep Routes Thin

App routes should read route params and render a feature component.

```tsx
function PolicyDetailPage() {
  const { policyId } = useParams<{ policyId: string }>()

  if (!policyId) {
    return <Navigate to={paths.notFound.getHref()} replace />
  }

  return <PolicyDetail policyId={policyId} />
}
```

Route access belongs in the app router:

```tsx
{
  path: paths.policies.path,
  element: protectedRoute('policy:master-page', <PoliciesMasterPage />),
}
```

Feature components can still use `can()` for buttons, records, and fields.

## Build Order

1. Add shared domain types or feature-only types.
2. Add schemas, builders, and query keys.
3. Add API fetchers and TanStack Query hooks.
4. Build feature components.
5. Add permissions and thin app routes.
6. Add integration tests.

## Rules

- Keep feature code together.
- Do not import one feature from another.
- Move reused API code to `src/api`.
- Keep route access checks in the app layer.

[← Shared Components](./02_shared_components.md) | [Server Communication →](./04_server_communication.md)
