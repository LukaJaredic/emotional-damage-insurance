export type PolicyHolderType = 'individual' | 'business'

export type PolicyHolder = {
  id: string
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
