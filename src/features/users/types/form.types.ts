import type z from 'zod'

import type { createSchema, updateSchema } from '../utils/user-form'

export type CreateUserFormValues = z.infer<typeof createSchema>

export type UpdateUserFormValues = z.infer<typeof updateSchema>
