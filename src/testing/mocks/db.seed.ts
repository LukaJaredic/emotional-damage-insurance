import { drop } from '@mswjs/data'
import type { FactoryAPI } from '@mswjs/data/lib/glossary'

import { buildAuditFields, DEFAULT_AUDIT_USER_ID } from './audit'
import { models } from './db.models'
import { generatePolicies } from './generators/policy'
import { generatePolicyHolders } from './generators/policy-holder'
import { generateUsers } from './generators/user'

type SeedProfile = 'dev' | 'e2e'

const DEV_POLICY_COUNT = 12
const seedAuditFields = buildAuditFields(DEFAULT_AUDIT_USER_ID)

const adminUser = {
  ...seedAuditFields,
  id: 'admin-user',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  password: '2951957434',
  roles: ['admin'],
}

const EmployeeUser = {
  ...seedAuditFields,
  id: 'employee-user',
  firstName: 'Employee',
  lastName: 'User',
  email: 'employee@example.com',
  password: '2951957434',
  roles: ['employee'],
}

const CustomerUser = {
  ...seedAuditFields,
  id: 'customer-user',
  firstName: 'Customer',
  lastName: 'User',
  email: 'customer@example.com',
  password: '2951957434',
  roles: ['customer'],
}

type DB = FactoryAPI<typeof models>

function seed(db: DB, profile: SeedProfile) {
  drop(db)
  seedConstUsers(db)

  // if (profile === 'e2e') // Ready when needed

  if (profile === 'dev') {
    seedUsers(db, 100)
    seedPolicyHolders(db, 200)
    seedPolicies(db, DEV_POLICY_COUNT)
  }
}

function seedConstUsers(db: DB) {
  ;[adminUser, EmployeeUser, CustomerUser].forEach((user) => {
    const existingUser = db.user.findFirst({
      where: {
        email: {
          equals: user.email,
        },
      },
    })

    if (existingUser) {
      return
    }

    db.user.create(user)
  })
}

function seedUsers(db: DB, count: number = 100) {
  const users = generateUsers(count)
  users.forEach((user) => {
    if (
      db.user.findFirst({
        where: {
          id: {
            equals: user.id,
          },
        },
      }) ||
      db.user.findFirst({
        where: {
          email: {
            equals: user.email,
          },
        },
      })
    ) {
      return
    }

    db.user.create(user)
  })
}

function seedPolicyHolders(db: DB, count: number = 200) {
  const policyHolders = generatePolicyHolders(count)

  policyHolders.forEach((policyHolder) => {
    if (
      db.policyHolder.findFirst({
        where: {
          id: {
            equals: policyHolder.id,
          },
        },
      }) ||
      db.policyHolder.findFirst({
        where: {
          email: {
            equals: policyHolder.email,
          },
        },
      }) ||
      db.policyHolder.findFirst({
        where: {
          governmentId: {
            equals: policyHolder.governmentId,
          },
        },
      })
    ) {
      return
    }

    db.policyHolder.create(policyHolder)
  })
}

function seedPolicies(db: DB, count: number) {
  const policyHolderIds = db.policyHolder
    .getAll()
    .slice(0, count)
    .map((policyHolder) => policyHolder.id)
  const policies = generatePolicies(policyHolderIds)

  policies.forEach((policy) => {
    if (
      db.policy.findFirst({
        where: {
          id: {
            equals: policy.id,
          },
        },
      }) ||
      db.policy.findFirst({
        where: {
          name: {
            equals: policy.name,
          },
        },
      })
    ) {
      return
    }

    db.policy.create(policy as any)
  })

  seedPolicyUsers(db)
}

function seedPolicyUsers(db: DB) {
  const policies = db.policy.getAll()

  if (policies.length === 0) {
    return
  }

  db.user.getAll().forEach((user, index) => {
    const existingPolicyUser = db.policyUser.findFirst({
      where: {
        userId: {
          equals: user.id,
        },
      },
    })

    if (existingPolicyUser) {
      return
    }

    const policy = policies[index % policies.length]!

    db.policyUser.create({
      ...seedAuditFields,
      policyId: policy.id,
      userId: user.id,
      limits: { ...policy.limits },
    })
  })
}

export { seed, type SeedProfile }
