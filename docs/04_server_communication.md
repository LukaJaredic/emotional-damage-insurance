# Server Communication

## Main Pattern

Server state uses TanStack Query on top of the shared Axios client.

1. Write a fetcher.
2. Wrap it in a query or mutation hook.
3. Use query keys from the correct ownership layer.
4. Invalidate related keys after successful mutations.

## Main Files

- `src/lib/api.ts`: configured Axios client
- `src/lib/react-query.ts`: shared `QueryClient`
- `src/config/query-keys.ts`: query keys shared across features or app code
- `src/config/pagination.ts`: shared pagination defaults
- `src/api`: fetchers and hooks used outside one feature
- `src/features/*/api`: feature-only fetchers and hooks

Foundational files should prefer direct imports, such as `@/config/env`, when importing a barrel could create a dependency cycle.

## API Ownership

Use a feature API folder when only that feature needs the endpoint. Move the API to `src/api` when it is used by app-level code, shared components, or another feature.

Examples:

- `src/features/policies/api/get-policies.ts` is policy-only.
- `src/api/auth/get-me.ts` is used by app providers.
- `src/api/users/get-user.ts` is also used by `<Audit />`.
- `src/api/policy-holders/get-policy-holders.ts` is used by policy-holder lists and policy forms.

Export shared APIs from their local barrel and `src/api/index.ts`.

## Query Keys

Feature-only query keys stay in the feature's `utils` folder. Policies use `src/features/policies/utils/policy-query-keys.ts`.

Shared query keys live in `src/config/query-keys.ts`. This includes auth, shared user details, and policy-holder lists and details.

```ts
queryKey: queryKeys.policyHolders.list(params)
```

Query keys include values that change the response, such as page size, search text, or filters. Use `DEFAULT_PAGE_LOAD_SIZE` from `src/config/pagination.ts` when a list does not provide a page size.

## Queries And Mutations

Keep fetchers separate from hooks:

```ts
export async function getPolicyHolders(params: GetPolicyHoldersQuery) {
  const response = await api.get<PolicyHolder[]>(apiPaths.policyHolders.all(), {
    params,
  })

  return response.data
}
```

List hooks used by shared data components return `RemoteDataState`. Mutations should invalidate the relevant `all()` or `detail()` keys after success.

Non-GET failures already show a toast through the Axios interceptor. Components may still handle field errors or local status changes.

## Rules

- Keep fetchers separate from hooks.
- Keep APIs and query keys at the narrowest valid ownership level.
- Use invalidation instead of manually syncing several cached views.
- Do not import a feature API from another feature.

[← Features](./03_features.md) | [Lists And Tables →](./05_lists_and_tables.md)
