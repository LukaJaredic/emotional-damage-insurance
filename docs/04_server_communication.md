# Server Communication

## Main rule

This project revolves around TanStack Query.

The usual pattern is:

1. Write a fetcher function.
2. Wrap it in a query or mutation hook.
3. Use the right query keys for the code's ownership boundary.
4. Invalidate related queries and show success toasts after mutations.

## Shared pieces

- `src/lib/api.ts` contains the shared Axios client.
- `src/lib/react-query.ts` creates the shared `QueryClient`.
- `src/api/` contains common API fetchers and hooks used by app-level/shared code.
- `src/config/query-keys.ts` contains query keys used from shared/common code.
- `src/app/providers/app-provider.tsx` mounts `QueryClientProvider`.

## Query keys

Feature-only query keys stay in the feature.

Put feature query keys in the feature `utils/` folder, using this shape:

- file: `feature-name-query-keys.ts`
- export: `featureNameQueryKeys`

The policy holders feature is the current reference:

```ts
// src/features/policy-holders/utils/policy-holder-query-keys.ts
export const policyHolderQueryKeys = {
  all: () => ['policy-holders'] as const,
  list: ({ perPage, search, type }: UsePolicyHoldersQuery) =>
    [
      'policy-holders',
      perPage ?? DEFAULT_PAGE_LOAD_SIZE,
      search ?? '',
      type ?? '',
    ] as const,
  detail: (policyHolderId: string) =>
    ['policy-holders', policyHolderId] as const,
}
```

Put keys in `src/config/query-keys.ts` when they are used by shared/common code or app-level code. Current examples are auth session keys and shared user lookup keys:

```ts
export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  users: {
    detail: (userId: string) => ['users', userId] as const,
  },
}
```

## Common API modules

Use `src/api` for API code that crosses feature boundaries.

Current examples:

- `src/api/auth/get-me.ts` and `src/api/auth/logout.ts` are used by app providers/context.
- `src/api/users/get-user.ts` is used by the users detail page and shared `<Audit />` component.

Export common APIs from local barrels and `src/api/index.ts`, then import with `@/api`.

## Query example

`src/features/policy-holders/api/get-policy-holders.ts` is the main list example.

```ts
export async function getPolicyHolders(
  params: GetPolicyHoldersQuery,
): Promise<PolicyHolder[]> {
  const response = await api.get<PolicyHolder[]>('/policy-holders', { params })
  return response.data
}
```

Then wrap it in a TanStack Query hook.

```ts
export function usePolicyHolders(
  params: UsePolicyHoldersQuery,
): RemoteDataState<PolicyHolder> {
  const query = useInfiniteQuery({
    queryKey: policyHolderQueryKeys.list(params),
    queryFn: ({ pageParam }) =>
      getPolicyHolders({
        ...params,
        page: pageParam,
      }),
  })

  return {
    items: query.data?.pages.flat() ?? [],
    isInitialLoading: query.isPending,
    isFetchingMore: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage,
  }
}
```

This exact setup is recommended for infinite-scrolling lists, and especially useful in combination with: `RemoteData` and `RemoteDataWithFilters` components (see: [Lists And Tables](./05_lists_and_tables.md)).

## Mutation example

Mutations should invalidate the relevant queries.

```ts
export function useCreatePolicyHolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPolicyHolder,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: policyHolderQueryKeys.all(),
      })
    },
  })
}
```

## Simple rules

- Keep feature-only fetchers inside feature `api/` files.
- Move reused/common fetchers and hooks to `src/api`.
- Keep feature query keys inside the feature, usually in `utils/feature-name-query-keys.ts`.
- Keep shared/common query keys in `src/config/query-keys.ts`.
- Use invalidation instead of manually syncing many views.
- Non-GET API errors are already shown through the shared Axios interceptor.

[← Features](./03_features.md) | [Lists And Tables →](./05_lists_and_tables.md)
