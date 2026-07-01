# Shared Components

## When to make something shared

Put a component in `src/components` only when it is generic and reusable.

Good shared examples:

- `PageLayout`
- `InputField`
- `SelectField`
- `ConfirmDialog`
- `Audit`

Keep it inside a feature when it is specific to that feature.

Keep feature-local examples:

- `UserFormDialog`
- `UserDeleteDialog`
- `UserCard`

## Where to put it

- `src/components/ui` for generic UI pieces
- `src/components/layout` for layout helpers
- `src/components/form` for shared form inputs and filters
- `src/components/data` for generic data display components

## Shared Data Dependencies

Shared components must not import feature code. If a shared component needs server data, move that endpoint to `src/api` first and import it from there.

For example, `<Audit />` lives in `src/components/ui` and loads users through `useUserDetail` from `@/api`, not through `src/features/users`.

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
- Export from the local barrel so features can import from one place - reducing the number of import lines - clutter.
- Import React APIs explicitly from `react`, for example `import { useState, type ReactNode } from 'react'`.
- Do not use `React.useState`, `React.ReactNode`, `React.ComponentProps`, or `import * as React` in project-owned code.
- `src/components/ui/shadcn` is exempt because shadcn/Radix primitives follow upstream namespace-import patterns.

[← Auth](./01_auth.md) | [Features →](./03_features.md)
