import { addDays, startOfTomorrow } from 'date-fns'

import type { CreatePolicyAction } from '@/api/policies'
import { toInputDate } from '@/utils'

import type {
  PolicyFormDefaultValues,
  PolicyFormValues,
} from './policy-form.types'

export function buildPolicyFormValues(
  defaultValues: PolicyFormDefaultValues = {},
): PolicyFormValues {
  return {
    policyHolderId: defaultValues.policyHolderId ?? '',
    name: defaultValues.name ?? '',
    premium: defaultValues.premium ?? 0,
    startDate: defaultValues.startDate ?? toInputDate(startOfTomorrow()),
    endDate:
      defaultValues.endDate ?? toInputDate(addDays(startOfTomorrow(), 30)),
    limits: {
      insult: 0,
      rejection: 0,
      badJoke: 0,
      gaslighting: 0,
      overthinking: 0,
      awkwardSilence: 0,
      whyDontYouQuestion: 0,
      meetingThatCouldHaveBeenEmail: 0,
      ...defaultValues.limits,
    },
  }
}

export function buildCreatePolicyPayload(
  values: PolicyFormValues,
): CreatePolicyAction {
  return values
}
