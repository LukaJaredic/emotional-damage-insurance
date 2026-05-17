import type { z } from 'zod'

import type { UserRole } from '@/types/user'

import type { createSchema, updateSchema } from '../utils/user-form'

export type CreateUserFormValues = z.infer<typeof createSchema>
export type CreateUserAction = CreateUserFormValues

export type UpdateUserFormValues = z.infer<typeof updateSchema>
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

export type DeleteUserAction = {
  userId: string
}
