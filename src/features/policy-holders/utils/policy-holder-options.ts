import type { SelectOption } from '@/components/form'
import type { PolicyHolderType } from '@/types/policy-holder'
import { policyHolderTypeLabels } from '@/utils'

export const typeOptions: SelectOption[] = (
  ['individual', 'business'] satisfies PolicyHolderType[]
).map((type) => ({
  label: policyHolderTypeLabels[type],
  value: type,
}))
