import { addDays, isValid, parseISO } from 'date-fns'
import z from 'zod'

import { requiredDateString, requiredNumber, requiredString } from '@/utils'

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

export const createPolicySchema = z
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
