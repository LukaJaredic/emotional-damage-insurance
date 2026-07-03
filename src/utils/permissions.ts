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
    // Users
    .allowPage('user:master-page')
    .allow('user:read')
    .allow('user:create')

    .allowPage('user:detail-page')
    .allow('user:update')
    .allow('user:delete')
    // Policy Holders
    .allowPage('policy-holder:master-page')
    .allow('policy-holder:read')
    .allow('policy-holder:create')

    .allowPage('policy-holder:detail-page')
    .allow('policy-holder:update')
    .allow('policy-holder:delete')
    // Policies
    .allowPage('policy:master-page')
    .allow('policy:read')
    .allow('policy:create')

    .allowPage('policy:detail-page')
    .allow('policy:update')
    .allow('policy:delete')
}

function addEmployeePermissions(builder: PermissionsBuilder, user: User) {
  builder
    .allowPage('home')
    // Users
    .allowPage('user:master-page')
    .allow('user:read')

    .allowPage('user:detail-page')
    .allow('user:update', { id: user.id }, ['firstName', 'lastName', 'email'])
    .allow('user:update', { roles: ['customer'] }, [
      'firstName',
      'lastName',
      'email',
    ])
    // Policy Holders
    .allowPage('policy-holder:master-page')
    .allow('policy-holder:read')
    .allow('policy-holder:create')

    .allowPage('policy-holder:detail-page')
    .allow('policy-holder:update')
    // Policies
    .allowPage('policy:master-page')
    .allow('policy:read')
    .allow('policy:create')

    .allowPage('policy:detail-page')
    .allow('policy:update')
}

function addCustomerPermissions(builder: PermissionsBuilder, user: User) {
  builder
    .allowPage('home')

    .allowPage('user:detail-page')
    .allow('user:read', { id: user.id, roles: ['customer'] })
    .allow('user:update', { id: user.id }, ['firstName', 'lastName', 'email'])
}
