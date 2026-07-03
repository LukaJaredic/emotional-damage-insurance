import { addDays, format, startOfTomorrow } from 'date-fns'
import z from 'zod'

import type { Policy } from '@/types'
import { requiredString } from '@/utils'

import type { CreatePolicyAction } from '../types/policy-api.types'
import type { PolicyFormValues } from '../types/policy-form.types'

// TBD: first time working with a date in this repo - see how we handle it
const dateString = requiredString().refine((value) => {
  return !Number.isNaN(new Date(value).getTime())
}, 'Invalid date')

const limitSchema = z.coerce
  .number()
  .nonnegative('Limit must be zero or greater')

const limitsSchema = z.object({
  insult: limitSchema,
  rejection: limitSchema,
  badJoke: limitSchema,
  gaslighting: limitSchema,
  overthinking: limitSchema,
  awkwardSilence: limitSchema,
  whyDontYouQuestion: limitSchema,
  meetingThatCouldHaveBeenEmail: limitSchema,
})

export const createSchema = z
  .object({
    policyHolderId: requiredString(),
    name: requiredString(1, 150),
    premium: z.coerce.number().positive('Premium must be greater than zero'),
    startDate: dateString,
    endDate: dateString,
    limits: limitsSchema,
  })
  .refine(
    ({ startDate, endDate }) => {
      const parsedStartDate = new Date(startDate)
      const parsedEndDate = new Date(endDate)

      if (
        Number.isNaN(parsedStartDate.getTime()) ||
        Number.isNaN(parsedEndDate.getTime())
      ) {
        return true
      }

      return parsedEndDate.getTime() >= addDays(parsedStartDate, 1).getTime()
    },
    {
      path: ['endDate'],
      message: 'The policy must last at least one day.',
    },
  )

function toDateInputValue(value?: Date | string) {
  if (!value) {
    return ''
  }

  try {
    return format(new Date(value), 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

export function buildPolicyFormValues(policy?: Policy): PolicyFormValues {
  return {
    policyHolderId: policy?.policyHolderId ?? '',
    name: policy?.name ?? '',
    premium: policy?.premium ?? 0,
    startDate: toDateInputValue(policy?.startDate || startOfTomorrow()),
    endDate: toDateInputValue(
      policy?.endDate || addDays(startOfTomorrow(), 30),
    ),
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
