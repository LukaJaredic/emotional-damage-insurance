import type z from 'zod'

import type { createSchema, updateSchema } from '../utils/policy-holder-form'

export type CreatePolicyHolderFormValues = z.infer<typeof createSchema>
export type UpdatePolicyHolderFormValues = z.infer<typeof updateSchema>
export type PolicyHolderFormValues =
  | CreatePolicyHolderFormValues
  | UpdatePolicyHolderFormValues

export type PolicyHolderFormStatus = 'idle' | 'pending' | 'success'
