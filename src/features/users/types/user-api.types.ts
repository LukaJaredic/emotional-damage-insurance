import type {
  CreateUserFormValues,
  UpdateUserFormValues,
} from './user-form.types'

export type CreateUserAction = CreateUserFormValues

export type UpdateUserAction = {
  userId: string
  data: UpdateUserFormValues
}

export type DeleteUserAction = {
  userId: string
}
