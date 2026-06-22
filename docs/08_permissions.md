# Permissions

## Main Idea

Permissions are built centrally from the current user, then read through `usePermissions()` in feature UI.

There are two kinds of permission checks:

- page access checks with `allowPage()` and `canAccess()`
- resource action checks with `allow()` and `can()`

Use page access for routes and navigation. Use resource actions for buttons, forms, fields, and record-level decisions.

The main files are:

- `src/utils/permissions.ts` defines role rules with `allowPage()` and `allow()`.
- `src/utils/permission-builder.ts` implements `canAccess()` and `can()`.
- `src/app/providers/permissions-provider.tsx` builds permissions for the current user.
- `src/hooks/use-permissions.ts` exposes permissions to components.
- `src/app/auth-guard.tsx` redirects users who cannot access a protected page.
- `src/app/sidebar-items.tsx` declares which page access each sidebar item needs.

## Page Access

Page access answers: "Can this user open this page?"

Page access values are typed by `PageAccess` in `src/utils/permission-builder.ts`.

Current examples:

- `home`
- `users:master-page`
- `users:detail-page`

Grant page access with `allowPage()` while building role permissions.

```ts
function addAdminPermissions(builder: PermissionsBuilder) {
  builder
    .allowPage('home')
    .allowPage('users:master-page')
    .allowPage('users:detail-page')
}
```

Check page access with `canAccess()`.

```tsx
const { canAccess } = usePermissions()

return sidebarItems
  .filter((item) => canAccess(item.access))
  .map((item) => <SidebarItem item={item} key={item.href} />)
```

Protected routes should pass a `PageAccess` value to `AuthGuard`.

```tsx
function protectedRoute(pageName: PageAccess, page: React.ReactNode) {
  return (
    <AuthGuard page={pageName}>
      <AppLayout>{page}</AppLayout>
    </AuthGuard>
  )
}
```

If the user is logged in but does not have access to that page, `AuthGuard` redirects them to the not-found page.

```tsx
if (page && !canAccess(page)) {
  return <Navigate to={paths.notFound.getHref()} replace />
}
```

Sidebar items should declare the page access they need.

```ts
export const sidebarItems: SidebarItem[] = [
  {
    title: 'Users',
    href: paths.users.getHref(),
    icon: UsersThreeIcon,
    access: 'users:master-page',
  },
]
```

Do not use `can('user:read')` to decide if a route is accessible. A user can have read permission for a specific record without being allowed to open the master page.

## `allow()`

Use `allow()` while building resource action permissions.

```ts
allow(resourceAction, conditions?, allowedFields?)
```

- `resourceAction` is an action like `user:read`, `user:update`, or `user:delete`.
- `conditions` limit the rule to matching resource instances.
- `allowedFields` limit the rule to specific fields.
- Omitting `conditions` means all instances.
- Omitting `allowedFields` means all fields.

Admin permissions usually grant full access:

```ts
function addAdminPermissions(builder: PermissionsBuilder) {
  builder
    .allowPage('home')

    .allowPage('users:master-page')
    .allow('user:read')
    .allow('user:create')

    .allowPage('users:detail-page')
    .allow('user:update')
    .allow('user:delete')
}
```

Employee permissions can combine broad reads with constrained updates:

```ts
function addEmployeePermissions(builder: PermissionsBuilder, user: User) {
  builder
    .allowPage('home')

    .allowPage('users:master-page')
    .allow('user:read')

    .allowPage('users:detail-page')
    .allow('user:read', { id: user.id })
    .allow('user:update', { id: user.id }, ['firstName', 'lastName', 'email'])
    .allow('user:update', { roles: ['customer'] }, [
      'firstName',
      'lastName',
      'email',
    ])
}
```

That means the employee can update their own basic profile fields and the same basic fields for customer users.

Customer permissions are more limited:

```ts
function addCustomerPermissions(builder: PermissionsBuilder, user: User) {
  builder
    .allowPage('home')

    .allowPage('users:detail-page')
    .allow('user:read', { id: user.id, roles: ['customer'] })
    .allow('user:update', { id: user.id }, ['firstName', 'lastName', 'email'])
}
```

That means customers can open their own detail page and update their own basic profile fields, but they cannot open the users master page.

## `can()`

Use `can()` from `usePermissions()` when rendering UI.

```tsx
const { can } = usePermissions()
```

Ask the narrowest question that matches the UI decision.

For a page-level action, pass the resource instance:

```tsx
return can('user:delete', user) ? (
  <UserDeleteDialog user={user}>
    <Button variant="destructive">Delete this user</Button>
  </UserDeleteDialog>
) : null
```

For an edit trigger that should show when at least one field can be updated, use `'*'` for the field:

```tsx
return can('user:update', user, '*') ? (
  <UserFormDialog user={user}>
    <Button>Edit this user</Button>
  </UserFormDialog>
) : null
```

For field-level forms, check the specific field:

```tsx
function isFieldDisabled(fieldName: keyof UserFormValues) {
  if (!isEdit) {
    return false
  }

  return !can('user:update', user, fieldName)
}
```

## How Arguments Behave

`can()` accepts:

```ts
can(resourceAction, resourceInstance?, field?)
```

- `can('user:update')` checks whether the user can update all user instances and all fields.
- `can('user:update', user)` checks whether the user can update that user instance and all fields.
- `can('user:update', user, 'email')` checks whether the user can update `email` on that user instance.
- `can('user:update', '*', 'email')` checks whether the user can update `email` on at least one user.
- `can('user:update', user, '*')` checks whether the user can update at least one field on that user instance.
- `can('user:update', '*', '*')` checks whether the user can update at least one field on at least one user.

## Adding A New Page

When adding a new protected page:

- add or reuse a `PageAccess` value
- grant that page with `allowPage()` in `src/utils/permissions.ts`
- protect the route with `protectedRoute(pageAccess, page)` or `<AuthGuard page={pageAccess}>`
- add `access: pageAccess` to sidebar items that point to the page
- use `can()` separately for buttons and fields inside the page

Example:

```tsx
{
  path: paths.users.path,
  element: protectedRoute('users:master-page', <UsersMasterPage />),
}
```

## Simple Rules

- Add permission rules in `src/utils/permissions.ts`, not inside components.
- Use `allowPage()` for route and navigation access.
- Use `allow()` to describe resource actions and ownership rules once.
- Use `canAccess()` for routes and sidebar visibility.
- Use `can()` in UI to hide actions, disable fields, and avoid showing flows the user cannot complete.
- Prefer passing a real resource instance when the UI is about one specific record.
- Use `'*'` only for "any instance" or "any field" UI checks.
- Keep page access separate from resource action checks.
- Treat frontend permissions as UX only. The API still needs to enforce authorization.

[← Dialogs And Alerts](./07_dialogs_and_alerts.md) | [Testing →](./09_testing.md)
