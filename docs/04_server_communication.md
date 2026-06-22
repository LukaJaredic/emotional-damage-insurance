# Server Communication

## Main rule

This project revolves around TanStack Query.

The usual pattern is:

1. Write a fetcher function.
2. Wrap it in a query or mutation hook.
3. Use the query keys owned by the feature.
4. Invalidate related queries and show success toasts after mutations.

## Shared pieces

- `src/lib/api.ts` contains the shared Axios client.
- `src/lib/react-query.ts` creates the shared `QueryClient`.
- `src/utils/query-keys.ts` contains query keys used from shared code.
- `src/app/providers/app-provider.tsx` mounts `QueryClientProvider`.

## Query keys

Each feature owns its own query keys.

Put feature query keys in the feature `utils/` folder, using this shape:

- file: `feature-name-query-keys.ts`
- export: `featureNameQueryKeys`

The users feature is the current reference:

```ts
// src/features/users/utils/user-query-keys.ts
export const userQueryKeys = {
  all: () => ['users'] as const,
  list: ({ perPage, search, roles }: UseUsersQuery) =>
    [
      'users',
      'list',
      perPage ?? DEFAULT_PAGE_LOAD_SIZE,
      search ?? '',
      'roles',
      ...[...(roles ?? [])].sort(),
    ] as const,
  detail: (userId: string) => ['users', 'detail', userId] as const,
}
```

Only put a key in `src/utils/query-keys.ts` when the key is used by shared space outside a single feature. Auth is the main example because `useMe()` and `useLogout()` live in shared utilities.

## Query example

`src/features/users/api/get-users.ts` is the main list example.

```ts
export async function getUsers(params: GetUsersQuery): Promise<User[]> {
  const response = await api.get<User[]>('/users', { params })
  return response.data
}
```

Then wrap it in a TanStack Query hook.

```ts
export function useUsers(params: UseUsersQuery): RemoteDataState<User> {
  const query = useInfiniteQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: ({ pageParam }) =>
      getUsers({
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
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.all() })
    },
  })
}
```

## Simple rules

- Keep fetchers inside feature `api/` files.
- Keep feature query keys inside the feature, usually in `utils/feature-name-query-keys.ts`.
- Keep shared-space query keys in `src/utils/query-keys.ts`.
- Use invalidation instead of manually syncing many views.
- Non-GET API errors are already shown through the shared Axios interceptor.

[← Features](./03_features.md) | [Lists And Tables →](./05_lists_and_tables.md)
