import type { User } from '@/types'

import { PermissionsBuilder } from './permission-builder'

export function buildPermissionsFor(user: User) {
  const builder = new PermissionsBuilder()

  if (user.roles.includes('admin')) {
    addAdminPermissions(builder)
  }

  if (user.roles.includes('employee')) {
    addEmployeePermissions(builder, user)
  }

  if (user.roles.includes('customer')) {
    addCustomerPermissions(builder, user)
  }

  return builder.build()
}

function addAdminPermissions(builder: PermissionsBuilder) {
  builder
    .allow('user:create')
    .allow('user:read')
    .allow('user:update')
    .allow('user:delete')
}

function addEmployeePermissions(builder: PermissionsBuilder, user: User) {
  builder
    .allow('user:read', { id: user.id })
    .allow('user:read', { roles: ['customer'] })
    .allow('user:update', { id: user.id }, ['firstName', 'lastName', 'email'])
    .allow('user:update', { roles: ['customer'] }, [
      'firstName',
      'lastName',
      'email',
    ])
}

function addCustomerPermissions(builder: PermissionsBuilder, user: User) {
  builder
    .allow('user:read', { id: user.id, roles: ['customer'] })
    .allow('user:update', { id: user.id }, ['firstName', 'lastName', 'email'])
}
