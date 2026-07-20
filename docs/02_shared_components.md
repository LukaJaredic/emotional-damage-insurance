# Shared Components

## When to make something shared

Put a component in `src/components` only when it is generic and reusable.

Good shared examples:

- `PageLayout`
- `InputField`
- `SelectField`
- `RemoteSelectField`
- `ConfirmDialog`
- `Audit`
- `UserCard`
- `PolicyCard`

Reusable domain presentation can also be shared when more than one feature or page needs the same read-only display. Put those components in a domain folder such as `src/components/users` or `src/components/policies`.

Keep it inside a feature when it is specific to that feature's workflow.

Keep feature-local examples:

- `UserFormDialog`
- `UserDeleteDialog`
- `PolicyTerminateDialog`

## Where to put it

- `src/components/ui` for generic UI pieces
- `src/components/layout` for layout helpers
- `src/components/form` for shared form inputs and filters
- `src/components/data` for generic data display components
- `src/components/users` for reusable user presentation
- `src/components/policies` for reusable policy presentation

## Shared Data Dependencies

Shared components must not import feature code. If a shared component needs server data, move that endpoint to `src/api` first and import it from there.

For example, `<Audit />` loads users through `@/api`, not through `src/features/users`. Policy presentation components live in `src/components/policies`, and the policy list API lives in `src/api/policies` because policy master pages and policy-holder details both consume it.

## How to export it

Add the file to the correct folder, then export it from that folder's `index.ts`.

```tsx
// src/components/ui/status-badge.tsx
type StatusBadgeProps = {
  label: string
}

function StatusBadge({ label }: StatusBadgeProps) {
  return <span>{label}</span>
}

export default StatusBadge
```

```ts
// src/components/ui/index.ts
export { default as StatusBadge } from './status-badge'
```

Use it like this:

```tsx
import { StatusBadge } from '@/components/ui'
```

## Simple rules

- Keep shared components small and composable.
- Do not import feature code into `src/components`.
- Export from the local barrel so consumers have a clear import path.
- Import React APIs explicitly from `react`, for example `import { useState, type ReactNode } from 'react'`.
- Do not use `React.useState`, `React.ReactNode`, `React.ComponentProps`, or `import * as React` in project-owned code.
- `src/components/ui/shadcn` is exempt because shadcn/Radix primitives follow upstream namespace-import patterns.

[← Auth](./01_auth.md) | [Features →](./03_features.md)
