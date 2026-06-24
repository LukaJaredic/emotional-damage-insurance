import { drop } from '@mswjs/data'
import type { FactoryAPI } from '@mswjs/data/lib/glossary'

import { models } from './db.models'
import { generatePolicyHolders } from './generators/policy-holder'
import { generateUsers } from './generators/user'

type SeedProfile = 'dev' | 'e2e'

const adminUser = {
  id: 'admin-user',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  password: '2951957434',
  roles: ['admin'],
}

const EmployeeUser = {
  id: 'employee-user',
  firstName: 'Employee',
  lastName: 'User',
  email: 'employee@example.com',
  password: '2951957434',
  roles: ['employee'],
}

const CustomerUser = {
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

export { seed, type SeedProfile }
