import z from 'zod'

import type { PolicyHolder } from '@/types'
import { email, requiredString, singleSelect } from '@/utils'

import type { PolicyHolderFormValues } from '../types/policy-holder-form.types'

const baseSchema = z.object({
  type: singleSelect(['individual', 'business'], true),
  email: email(),
  phone: requiredString().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
})

export const createSchema = z.discriminatedUnion('type', [
  baseSchema.extend({
    type: z.literal('individual'),
    firstName: requiredString(1, 50),
    lastName: requiredString(1, 50),
    governmentId: requiredString().regex(/^\d{13}$/, 'Invalid government ID'),
  }),
  baseSchema.extend({
    type: z.literal('business'),
    businessName: requiredString(1, 150),
    governmentId: requiredString().regex(/^\d{8}$/, 'Invalid tax ID'),
  }),
])

export const updateSchema = createSchema

export function buildPolicyHolderFormValues(
  policyHolder?: PolicyHolder,
): PolicyHolderFormValues {
  if (policyHolder?.type === 'business') {
    return {
      type: 'business',
      email: policyHolder.email,
      phone: policyHolder.phone,
      governmentId: policyHolder.governmentId,
      businessName: policyHolder.businessName,
    }
  }

  return {
    type: 'individual',
    email: policyHolder?.email ?? '',
    phone: policyHolder?.phone ?? '',
    governmentId: policyHolder?.governmentId ?? '',
    firstName: policyHolder?.firstName ?? '',
    lastName: policyHolder?.lastName ?? '',
  }
}

export function buildUpdatePolicyHolderPayload(
  policyHolderId: PolicyHolder['id'],
  values: PolicyHolderFormValues,
) {
  return {
    policyHolderId,
    data: values,
  }
}

export function buildCreatePolicyHolderPayload(values: PolicyHolderFormValues) {
  return values
}
