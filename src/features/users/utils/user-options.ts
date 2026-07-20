import type { SelectOption } from '@/components/form'
import type { UserRole } from '@/types'
import { userRoleLabels } from '@/utils'

export const roleOptions: SelectOption[] = (
  ['admin', 'employee', 'customer'] satisfies UserRole[]
).map((role) => ({
  label: userRoleLabels[role],
  value: role,
}))
