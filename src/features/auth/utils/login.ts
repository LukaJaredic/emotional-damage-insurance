import { z } from 'zod'

import { requiredString } from '@/utils/zod-schemas'

export const loginSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: requiredString(6),
})

export type LoginFormData = z.infer<typeof loginSchema>
