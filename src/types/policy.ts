import type { BaseEntity } from './base-entity'
import type { PolicyHolder } from './policy-holder'
import type { User } from './user'

export type PolicyLimits = {
  insult: number
  rejection: number
  badJoke: number
  gaslighting: number
  overthinking: number
  awkwardSilence: number
  whyDontYouQuestion: number
  meetingThatCouldHaveBeenEmail: number
}

export type Policy = BaseEntity & {
  policyHolderId: PolicyHolder['id']
  terminated: boolean
  name: string
  premium: number
  startDate: Date
  endDate: Date
  limits: PolicyLimits
}

export type PolicyUser = BaseEntity & {
  policyId: Policy['id']
  userId: User['id']
  limits: PolicyLimits
}
