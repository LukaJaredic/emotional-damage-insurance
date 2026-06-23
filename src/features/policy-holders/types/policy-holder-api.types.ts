import type { PolicyHolderType } from '@/types'

import type {
  CreatePolicyHolderFormValues,
  UpdatePolicyHolderFormValues,
} from './policy-holder-form.types'

export type CreatePolicyHolderAction = CreatePolicyHolderFormValues

export type UpdatePolicyHolderAction = {
  policyHolderId: string
  data: UpdatePolicyHolderFormValues
}

export type GetPolicyHolderQuery = {
  policyHolderId: string
}

export type GetPolicyHoldersQuery = {
  page: number
  perPage?: number
  search?: string
  type?: PolicyHolderType
}

export type UsePolicyHoldersQuery = Omit<GetPolicyHoldersQuery, 'page'>

export type DeletePolicyHolderAction = {
  policyHolderId: string
}
