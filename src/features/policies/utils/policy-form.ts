import { addDays, isValid, parseISO, startOfTomorrow } from 'date-fns'
import z from 'zod'

import type { Policy } from '@/types'
import {
  requiredDateString,
  requiredNumber,
  requiredString,
  toInputDate,
} from '@/utils'

import type { CreatePolicyAction } from '../types/policy-api.types'
import type { PolicyFormValues } from '../types/policy-form.types'

const limitsSchema = z.object({
  insult: requiredNumber(0),
  rejection: requiredNumber(0),
  badJoke: requiredNumber(0),
  gaslighting: requiredNumber(0),
  overthinking: requiredNumber(0),
  awkwardSilence: requiredNumber(0),
  whyDontYouQuestion: requiredNumber(0),
  meetingThatCouldHaveBeenEmail: requiredNumber(0),
})

export const createSchema = z
  .object({
    policyHolderId: requiredString(),
    name: requiredString(1, 150),
    premium: z.coerce.number().positive('Premium must be greater than zero'),
    startDate: requiredDateString(),
    endDate: requiredDateString(),
    limits: limitsSchema,
  })
  .refine(
    ({ startDate, endDate }) => {
      const parsedStartDate = parseISO(startDate)
      const parsedEndDate = parseISO(endDate)

      if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
        return true
      }

      return parsedEndDate.getTime() >= addDays(parsedStartDate, 1).getTime()
    },
    {
      path: ['endDate'],
      message: 'The policy must last at least one day.',
    },
  )

export function buildPolicyFormValues(policy?: Policy): PolicyFormValues {
  return {
    policyHolderId: policy?.policyHolderId ?? '',
    name: policy?.name ?? '',
    premium: policy?.premium ?? 0,
    startDate: toInputDate(policy?.startDate || startOfTomorrow()),
    endDate: toInputDate(policy?.endDate || addDays(startOfTomorrow(), 30)),
    limits: {
      insult: policy?.limits.insult ?? 0,
      rejection: policy?.limits.rejection ?? 0,
      badJoke: policy?.limits.badJoke ?? 0,
      gaslighting: policy?.limits.gaslighting ?? 0,
      overthinking: policy?.limits.overthinking ?? 0,
      awkwardSilence: policy?.limits.awkwardSilence ?? 0,
      whyDontYouQuestion: policy?.limits.whyDontYouQuestion ?? 0,
      meetingThatCouldHaveBeenEmail:
        policy?.limits.meetingThatCouldHaveBeenEmail ?? 0,
    },
  }
}

export function buildCreatePolicyPayload(
  values: PolicyFormValues,
): CreatePolicyAction {
  return values
}
