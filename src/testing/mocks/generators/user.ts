import { faker } from '@faker-js/faker'
import { nanoid } from 'nanoid'

import { buildAuditFields, DEFAULT_AUDIT_USER_ID } from '@testing/mocks/audit'
import type { MockUser } from '@testing/mocks/handlers/users'
import { hash } from '@testing/mocks/helpers'

function generateUser(): MockUser {
  const firstName = faker.person.firstName()

  return {
    ...buildAuditFields(DEFAULT_AUDIT_USER_ID),
    id: nanoid(),
    firstName: firstName,
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: hash(`${firstName.toLocaleLowerCase()}123`),
    roles: [faker.helpers.arrayElement(['admin', 'customer', 'employee'])],
  }
}

function generateUsers(count: number): MockUser[] {
  return Array.from({ length: count }, generateUser)
}

export { generateUser, generateUsers }
