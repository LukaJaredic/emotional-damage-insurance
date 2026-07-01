# Forms

## Main rule

Feature forms own their schema, types, default values, and submit logic.

Shared field components live in `src/components/form`.

## Users form example

The users form is split like this:

- `src/features/users/utils/user-form.ts`: schemas and builders
- `src/features/users/types/user-form.types.ts`: inferred form types
- `src/features/users/components/form/user-form.tsx`: form UI and submit flow

## Shared fields

Use the shared field components instead of wiring labels and errors by hand.

- `InputField` for text, email, number, and password inputs
- `SelectField` for single and multi select inputs

## Simple example

```tsx
const form = useForm<UserFormValues>({
  resolver: zodResolver(isEdit ? updateSchema : createSchema),
  defaultValues: buildUserFormValues(user),
})
```

Then render shared fields.

```tsx
<InputField
  control={form.control}
  name="email"
  id="email"
  label="Email"
  type="email"
/>

<SelectField
  control={form.control}
  name="roles"
  id="roles"
  label="Roles"
  options={roleOptions}
  isMultiple
/>
```

## Component layout

Inside form components, group related declarations with blank lines.

Keep declarations ordered and visually separated by purpose:

- mode flags, for example `const isEdit = !!user`
- permissions and other context hooks
- mutations
- form setup
- derived state, for example `const isPending = ...`

This keeps form setup readable as forms grow.

## Submit flow

The normal flow is:

1. Validate with Zod.
2. Build the final payload in a feature utility.
3. Call the feature mutation.

For users, the builders are:

- `buildUserFormValues()`
- `buildCreateUserPayload()`
- `buildUserUpdatePayload()`

## Generated Fields

Forms must not expose or submit backend-generated fields.

Current generated fields are the shared `BaseEntity` fields:

- `id`
- `createdAt`
- `lastEditedAt`
- `createdBy`
- `lastEditedBy`

Audit fields are generated in the backend/mock backend and rendered on detail pages with the shared `<Audit />` component.

## Simple rules

- Keep schemas and builders inside the feature.
- Keep shared input behavior inside `src/components/form`.
- Do not include generated audit fields in form schemas, default values, or payload builders.
- Use inferred types from the Zod schema.
- Prefer one form component that can handle create and edit when the fields are mostly the same.

[← Lists And Tables](./05_lists_and_tables.md) | [Dialogs And Alerts →](./07_dialogs_and_alerts.md)
