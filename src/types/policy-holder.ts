import type { BaseEntity } from './base-entity'

export type PolicyHolderType = 'individual' | 'business'

export type PolicyHolder = BaseEntity & {
  governmentId: string
  email: string
  phone: string
} & (
    | {
        type: 'individual'
        firstName: string
        lastName: string
      }
    | {
        type: 'business'
        businessName: string
      }
  )
