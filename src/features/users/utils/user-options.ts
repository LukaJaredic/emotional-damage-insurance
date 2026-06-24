import type { SelectOption } from '@/components/form'
import type { UserRole } from '@/types'

import { roleLabels } from './user-labels'

export const roleOptions: SelectOption[] = (
  ['admin', 'employee', 'customer'] satisfies UserRole[]
).map((role) => ({
  label: roleLabels[role],
  value: role,
}))
