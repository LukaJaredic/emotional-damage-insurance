# Testing

## Testing split

This project prefers:

- integration tests for most new coverage
- e2e tests for common feature flows
- unit tests only for important logic and shared behavior

Start with an integration test unless there is a clear reason not to.

## Commands

Run Vitest:

```bash
npm run test
```

Run Playwright e2e:

```bash
npm run e2e
```

Run Playwright in headed mode:

```bash
npm run e2e:headed
```

## Important rule

Do not run e2e while `npm run dev` is already running.

Playwright starts its own frontend server and mock API server. The config is set to fail if those ports are already in use.

## Testing philosophy

Test what the user can see and do.

Good questions to ask:

- Can the user see the correct content?
- Can the user perform the intended action?
- Does the app react correctly to success, empty, loading, and error states?
- Are permissions respected?

Avoid testing implementation details when possible. For example, prefer checking that rows appear on the page over checking that `useUsers()` was called.

## Useful files

Integration tests use Vitest, Testing Library, TanStack Query, React Router, and MSW.

Useful files:

- `src/testing/setup.ts`
- `src/testing/test-utils.tsx`
- `src/testing/mocks/server.ts`
- `src/testing/mocks/handlers/*`

`src/testing/setup.ts` already resets the DOM, mocks, mock DB, MSW handlers, cookies, and Query Client after each test.

Do not repeat that cleanup in every test. Only call `cleanup()` manually when one test intentionally renders multiple cases in a loop.

## Rendering

Use `renderApp()` when the test needs app providers, routing, auth, permissions, or React Query.

Unauthenticated example:

```tsx
await renderApp(<LoginPage />, {
  user: null,
  path: paths.auth.login.path,
  url: paths.auth.login.getHref('/users'),
})
```

Authenticated example:

```tsx
await renderApp(
  <AuthGuard shouldHaveUser page="users:master-page">
    <UsersMasterPage />
  </AuthGuard>,
  {
    user: testUsers.admin,
    path: paths.users.path,
    url: paths.users.getHref(),
  },
)
```

`renderApp()` creates the test user, logs them in, sets the auth cookie, renders providers, and waits for initial user loading to finish.

Return only useful extras from render helpers.

```tsx
async function renderUsersMaster() {
  await renderApp(<UsersMasterPage />, {
    user: testUsers.admin,
    path: paths.users.path,
    url: paths.users.getHref(),
  })

  return { user: userEvent.setup() }
}
```

Avoid returning the whole render result unless the test really needs it.

## Querying the screen

Prefer `screen.*` queries.

Use `getBy...` when the element must already be present:

```tsx
expect(
  screen.getByRole('button', { name: 'Create a user' }),
).toBeInTheDocument()
```

Use `findBy...` when the element appears after async work, like a query or mutation:

```tsx
expect(await screen.findByText('No users found.')).toBeInTheDocument()
```

Use `queryBy...` for absence:

```tsx
expect(
  screen.queryByRole('dialog', { name: 'Create a user' }),
).not.toBeInTheDocument()
```

Use `within(...)` when checking content inside a row, card, or dialog:

```tsx
const row = link.closest('tr')

expect(within(row!).getByText(user.email)).toBeInTheDocument()
```

Use `waitFor` when the assertion itself changes over time:

```tsx
await waitFor(() => {
  expect(requests).toEqual([expectedBody])
})
```

## User interactions

Use `userEvent.setup()` and name the actor `user`.

```tsx
const user = userEvent.setup()

await user.type(screen.getByLabelText('Email'), 'admin@example.com')
await user.click(screen.getByRole('button', { name: 'Login' }))
```

If a render helper returns the actor, return `{ user }`.

```tsx
const { user } = await renderUsersMaster()

await user.click(screen.getByRole('button', { name: 'Create a user' }))
```

## Mocking APIs With MSW

Prefer MSW server overrides over mocking API hooks.

Good:

```tsx
server.use(
  http.get(`${env.API_URL}/users`, () => HttpResponse.json(returnedUsers)),
)
```

Avoid this in page and integration tests:

```tsx
vi.mock('@features/users/api/get-users', () => ({
  useUsers: vi.fn(),
}))
```

The MSW approach keeps the real hook, Axios client, React Query cache, auth cookies, and UI behavior in the test.

### Returning Data

```tsx
function mockUsersResponse(users: User[]) {
  server.use(http.get(`${env.API_URL}/users`, () => HttpResponse.json(users)))
}
```

### Returning An Error

```tsx
server.use(
  http.get(`${env.API_URL}/users`, () =>
    HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
  ),
)

expect(
  await screen.findByText(
    'An error occurred while loading users. Please try again.',
  ),
).toBeInTheDocument()
```

### Capturing Query Params

```tsx
const requests: URLSearchParams[] = []

server.use(
  http.get(`${env.API_URL}/users`, ({ request }) => {
    requests.push(new URL(request.url).searchParams)

    return HttpResponse.json(returnedUsers)
  }),
)

await user.type(screen.getByPlaceholderText('Search by name or email'), 'Mike')
await user.click(screen.getByRole('combobox'))
await user.click(await screen.findByRole('option', { name: 'Customer' }))

await waitFor(() => {
  expect(requests.at(-1)?.get('search')).toBe('Mike')
  expect(requests.at(-1)?.get('roles[]')).toBe('customer')
})
```

### Capturing Mutation Bodies

```tsx
const requests: unknown[] = []

server.use(
  http.post(`${env.API_URL}/users`, async ({ request }) => {
    const body = await request.json()
    requests.push(body)

    return HttpResponse.json(
      { id: 'created-user-id', ...body },
      { status: 201 },
    )
  }),
)

await user.click(screen.getByRole('button', { name: 'Create user' }))

await waitFor(() => {
  expect(requests).toEqual([expectedBody])
})
```

## When Mocks Are Okay

Mocks are still useful when they keep the test focused and simple.

Good examples:

- mock `useMediaQuery` to force desktop or mobile layout
- mock a child component if we need to trigger a callback we passed from the parent

Avoid mocking API hooks in page and integration tests. Prefer MSW for hooks like `useUsers()`, `useUserDetail()`, `useLogin()`, create mutations, and update mutations.

## E2E Tests

E2E tests live in `e2e/`.

Write them sparingly because they are heavier and slower than integration tests.

Current examples cover:

- login and logout
- user CRUD

## Unit Tests

Keep unit tests focused.

Good unit test targets:

- shared data display behavior
- important form validation behavior
- small reusable helpers with real branching logic

Do not unit test every small function by default.

## Simple Rules

- Start with an integration test.
- Use MSW instead of mocking API hooks.
- Use `screen.*` queries.
- Use `findBy...` for async UI.
- Use `queryBy...` only for absence.
- Use `within(...)` for scoped assertions.
- Keep render helpers small and return only useful values.
- Trust global test setup for cleanup and isolation.

[← Permissions](./08_permissions.md)
