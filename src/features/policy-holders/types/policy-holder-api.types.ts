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

export type DeletePolicyHolderAction = {
  policyHolderId: string
}
