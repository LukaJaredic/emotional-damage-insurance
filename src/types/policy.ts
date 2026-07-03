import type { BaseEntity } from './base-entity'
import type { PolicyHolder } from './policy-holder'

export type Policy = BaseEntity & {
  policyHolderId: PolicyHolder['id']
  terminated: boolean
  name: string
  premium: number
  startDate: Date
  endDate: Date
  limits: {
    insult: number
    rejection: number
    badJoke: number
    gaslighting: number
    overthinking: number
    awkwardSilence: number
    whyDontYouQuestion: number
    meetingThatCouldHaveBeenEmail: number
  }
}
