import { z } from 'zod'

import type { User } from '@/types/user'
import { email, multipleSelect, requiredString } from '@/utils/zod-schemas'

import type {
  CreateUserAction,
  UpdateUserAction,
} from '../types/user-api.types'
import type {
  CreateUserFormValues,
  UpdateUserFormValues,
  UserFormValues,
} from '../types/user-form.types'

export const createSchema = z.object({
  firstName: requiredString(),
  lastName: requiredString(),
  email: email(),
  password: requiredString(6),
  roles: multipleSelect(['admin', 'employee', 'customer'], true),
})

export const updateSchema = createSchema.omit({ password: true })

export function buildUserFormValues(user?: User): UserFormValues {
  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    ...(user?.id ? {} : { password: '' }),
    roles: user?.roles ?? [],
  }
}

export function buildUserUpdatePayload(
  id: User['id'],
  values: UpdateUserFormValues,
): UpdateUserAction {
  return {
    userId: id,
    data: values,
  }
}

export function buildCreateUserPayload(
  values: CreateUserFormValues,
): CreateUserAction {
  return values
}
