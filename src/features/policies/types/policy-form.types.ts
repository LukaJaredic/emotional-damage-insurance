import type z from 'zod'

import type { createSchema } from '../utils/policy-form'

export type CreatePolicyFormValues = z.infer<typeof createSchema>
export type PolicyFormValues = CreatePolicyFormValues

export type PolicyFormStatus = 'idle' | 'pending' | 'success'
