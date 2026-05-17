import { z } from 'zod'

import { email, multipleSelect, requiredString } from '@/utils/zod-schemas'

export const createSchema = z.object({
  firstName: requiredString(),
  lastName: requiredString(),
  email: email(),
  password: requiredString(6),
  roles: multipleSelect(['admin', 'employee', 'customer'], true),
})

export const updateSchema = createSchema.partial()
