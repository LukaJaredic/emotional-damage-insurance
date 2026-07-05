import type { Policy, PolicyLimits } from '@/types'
import { toEur } from '@/utils'

import { status } from './policy-status'

export const policyStatusLabels: Record<
  'active' | 'terminated' | 'expired' | 'future',
  string
> = {
  active: 'Active',
  terminated: 'Terminated',
  expired: 'Expired',
  future: 'Not started yet',
}

export function statusLabel(policy: Policy) {
  return policyStatusLabels[status(policy)]
}

export function premium(policy: Policy) {
  return toEur(policy.premium)
}

export const limitLabels: Record<keyof PolicyLimits, string> = {
  insult: 'Insult',
  rejection: 'Rejection',
  badJoke: 'Bad joke',
  gaslighting: 'Gaslighting',
  overthinking: 'Overthinking',
  awkwardSilence: 'Awkward silence',
  whyDontYouQuestion: "Why don't you question",
  meetingThatCouldHaveBeenEmail: 'Meeting that could have been email',
}
