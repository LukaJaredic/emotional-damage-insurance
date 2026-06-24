import type { SelectOption } from '@/components/form'
import type { PolicyHolderType } from '@/types/policy-holder'

import { typeLabels } from './policy-holder-labels'

export const typeOptions: SelectOption[] = (
  ['individual', 'business'] satisfies PolicyHolderType[]
).map((type) => ({
  label: typeLabels[type],
  value: type,
}))
