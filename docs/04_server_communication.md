# Server Communication

## Main rule

This project revolves around TanStack Query.

The usual pattern is:

1. Write a fetcher function.
2. Wrap it in a query or mutation hook.
3. Use shared query keys.
4. Invalidate related queries and show success toasts after mutations.

## Shared pieces

- `src/lib/api.ts` contains the shared Axios client.
- `src/lib/react-query.ts` creates the shared `QueryClient`.
- `src/config/query-keys.ts` contains shared query keys.
- `src/app/providers/app-provider.tsx` mounts `QueryClientProvider`.

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
    queryKey: queryKeys.users.list({ ...params, perPage: 25 }),
    queryFn: ({ pageParam }) =>
      getUsers({
        ...params,
        perPage: 25,
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })
}
```

## Simple rules

- Keep fetchers inside feature `api/` files.
- Keep query keys in `src/config/query-keys.ts`.
- Use invalidation instead of manually syncing many views.
- Non-GET API errors are already shown through the shared Axios interceptor.

Prev: [Features](./03_features.md)

Next: [Lists And Tables](./05_lists_and_tables.md)
