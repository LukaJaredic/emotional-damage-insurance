import type { UserRole } from '@/types'

export const userRoleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  employee: 'Employee',
  customer: 'Customer',
}

export const userRoles = (roles: UserRole[]) => {
  return roles.map((role) => userRoleLabels[role]).join(', ')
}
