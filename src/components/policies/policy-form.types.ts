import type z from 'zod'

import type { createPolicySchema } from './policy-form.schema'

export type CreatePolicyFormValues = z.infer<typeof createPolicySchema>
export type PolicyFormValues = CreatePolicyFormValues

export type PolicyFormDefaultValues = Partial<
  Omit<PolicyFormValues, 'limits'>
> & {
  limits?: Partial<PolicyFormValues['limits']>
}

export type PolicyFormStatus = 'idle' | 'pending' | 'success'
