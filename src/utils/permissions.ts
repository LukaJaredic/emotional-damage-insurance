import type { User } from '@/types'

import { PermissionsBuilder } from './permission-builder'

export function buildPermissionsFor(user: User | null) {
  const builder = new PermissionsBuilder()

  if (user?.roles.includes('admin')) {
    addAdminPermissions(builder)
  }

  if (user?.roles.includes('employee')) {
    addEmployeePermissions(builder, user)
  }

  if (user?.roles.includes('customer')) {
    addCustomerPermissions(builder, user)
  }

  return builder.build()
}

function addAdminPermissions(builder: PermissionsBuilder) {
  builder
    .allowPage('home')

    .allowPage('users:master-page')
    .allow('user:read')
    .allow('user:create')

    .allowPage('users:detail-page')
    .allow('user:update')
    .allow('user:delete')

    .allowPage('policy-holders:master-page')
    .allow('policy-holder:read')
    .allow('policy-holder:create')

    .allowPage('policy-holders:detail-page')
    .allow('policy-holder:update')
    .allow('policy-holder:delete')
}

function addEmployeePermissions(builder: PermissionsBuilder, user: User) {
  builder
    .allowPage('home')

    .allowPage('users:master-page')
    .allow('user:read')

    .allowPage('users:detail-page')
    .allow('user:update', { id: user.id }, ['firstName', 'lastName', 'email'])
    .allow('user:update', { roles: ['customer'] }, [
      'firstName',
      'lastName',
      'email',
    ])

    .allowPage('policy-holders:master-page')
    .allow('policy-holder:read')
    .allow('policy-holder:create')

    .allowPage('policy-holders:detail-page')
    .allow('policy-holder:update')
}

function addCustomerPermissions(builder: PermissionsBuilder, user: User) {
  builder
    .allowPage('home')

    .allowPage('users:detail-page')
    .allow('user:read', { id: user.id, roles: ['customer'] })
    .allow('user:update', { id: user.id }, ['firstName', 'lastName', 'email'])
}
