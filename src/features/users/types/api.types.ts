import type { UserRole } from '@/types'

import type { CreateUserFormValues, UpdateUserFormValues } from './form.types'

export type CreateUserAction = CreateUserFormValues

export type UpdateUserAction = {
  userId: string
  data: UpdateUserFormValues
}

export type GetUserQuery = {
  userId: string
}

export type GetUsersQuery = {
  page: number
  perPage?: number
  search?: string
  roles?: UserRole[]
}

export type UseUsersQuery = Omit<GetUsersQuery, 'page'>

export type DeleteUserAction = {
  userId: string
}
