import { zodResolver } from '@hookform/resolvers/zod'
import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'

import { InputField, SelectField } from '@/components/form'
import { Spinner } from '@/components/ui'
import { Button } from '@/components/ui/shadcn/button'
import { FieldGroup } from '@/components/ui/shadcn/field'
import { usePermissions } from '@/hooks'
import type { User } from '@/types'
import { rowSm } from '@/utils/style'
import { useCreateUser } from '@features/users/api/create-user'
import { useUpdateUser } from '@features/users/api/update-user'
import type {
  CreateUserFormValues,
  UpdateUserFormValues,
  UserFormStatus,
  UserFormValues,
} from '@features/users/types/user-form.types'
import {
  buildCreateUserPayload,
  buildUserFormValues,
  buildUserUpdatePayload,
  createSchema,
  updateSchema,
} from '@features/users/utils/user-form'
import { roleOptions } from '@features/users/utils/user-options'

export type UserFormProps = Omit<
  ComponentProps<'form'>,
  'onSubmit' | 'noValidate'
> & {
  user?: User | undefined
  showSubmit?: boolean | undefined
  onStatusChange?: ((status: UserFormStatus) => void) | undefined
}

function UserForm({
  user,
  showSubmit = true,
  onStatusChange,
  ...props
}: UserFormProps) {
  const isEdit = !!user

  const { can } = usePermissions()

  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? updateSchema : createSchema),
    defaultValues: buildUserFormValues(user),
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function isFieldDisabled(fieldName: keyof UserFormValues) {
    if (!isEdit) {
      return false
    }

    return !can('user:update', user, fieldName)
  }

  async function handleSubmit(data: UserFormValues) {
    // Submit button can be outside of the form
    if (isPending) {
      return
    }

    onStatusChange?.('pending')

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(
          buildUserUpdatePayload(user!.id, data as UpdateUserFormValues),
        )
      } else {
        await createMutation.mutateAsync(
          buildCreateUserPayload(data as CreateUserFormValues),
        )
      }

      onStatusChange?.('success')
    } catch {
      onStatusChange?.('idle')
    }
  }

  return (
    <form {...props} onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <div className={rowSm}>
          <InputField
            control={form.control}
            id="first-name"
            name="firstName"
            label="First name"
            type="text"
            autoComplete="given-name"
            placeholder="John"
            disabled={isFieldDisabled('firstName')}
          />
          <InputField
            control={form.control}
            id="last-name"
            name="lastName"
            label="Last name"
            type="text"
            autoComplete="family-name"
            placeholder="Doe"
            disabled={isFieldDisabled('lastName')}
          />
        </div>
        <SelectField
          control={form.control}
          id="roles"
          name="roles"
          label="Roles"
          placeholder="Choose roles"
          options={roleOptions}
          isMultiple
          disabled={isFieldDisabled('roles')}
        />
        <InputField
          control={form.control}
          id="email"
          name="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="john.doe@example.com"
          disabled={isFieldDisabled('email')}
        />
        {!isEdit ? (
          <InputField
            control={form.control}
            id="password"
            name={'password' as never}
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter a password"
          />
        ) : null}
      </FieldGroup>
      {showSubmit ? (
        <Button type="submit" className="mt-6" disabled={isPending}>
          {isPending ? <Spinner /> : null}
          {isEdit ? 'Save user' : 'Create user'}
        </Button>
      ) : null}
    </form>
  )
}

export default UserForm
