import { drop } from '@mswjs/data'
import type { FactoryAPI } from '@mswjs/data/lib/glossary'

import { models } from './db.models'
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

type DB = FactoryAPI<typeof models>

function seed(db: DB, profile: SeedProfile) {
  drop(db)
  seedAdminUser(db)

  // if (profile === 'e2e') // Ready when needed

  if (profile === 'dev') {
    seedUsers(db, 100)
  }
}

function seedAdminUser(db: DB) {
  const existingAdminUser = db.user.findFirst({
    where: {
      email: {
        equals: adminUser.email,
      },
    },
  })

  if (existingAdminUser) {
    return
  }

  db.user.create(adminUser)
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

export { seed, type SeedProfile }
