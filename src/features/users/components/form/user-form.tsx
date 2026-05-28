import { zodResolver } from '@hookform/resolvers/zod'
import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'

import { InputField, SelectField } from '@/components/form'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/shadcn/button'
import { FieldGroup } from '@/components/ui/shadcn/field'
import type { User } from '@/types'
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

type UserFormProps = Omit<ComponentProps<'form'>, 'onSubmit'> & {
  user?: User | undefined
  showSubmit?: boolean
  onStatusChange?: (status: UserFormStatus) => void | undefined
}

function UserForm({
  user,
  showSubmit = true,
  onStatusChange,
  className,
  ...props
}: UserFormProps) {
  const isEdit = !!user
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? updateSchema : createSchema),
    defaultValues: buildUserFormValues(user),
  })
  const isPending = createMutation.isPending || updateMutation.isPending

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
    <form
      {...props}
      className={className}
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
    >
      <FieldGroup>
        <InputField
          control={form.control}
          id="first-name"
          name="firstName"
          label="First name"
          type="text"
          autoComplete="given-name"
          placeholder="John"
        />
        <InputField
          control={form.control}
          id="last-name"
          name="lastName"
          label="Last name"
          type="text"
          autoComplete="family-name"
          placeholder="Doe"
        />
        <InputField
          control={form.control}
          id="email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="john.doe@example.com"
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
        <SelectField
          control={form.control}
          id="roles"
          name="roles"
          label="Roles"
          placeholder="Choose roles"
          options={[...roleOptions]}
          isMultiple
        />
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
