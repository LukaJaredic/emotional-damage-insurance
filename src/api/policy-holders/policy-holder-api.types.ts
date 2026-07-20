import type { PolicyHolderType } from '@/types'

export type GetPolicyHoldersQuery = {
  page: number
  perPage?: number
  search?: string
  type?: PolicyHolderType
}
