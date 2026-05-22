import { faker } from '@faker-js/faker'
import { nanoid } from 'nanoid'

import type { MockUser } from '../handlers/users'
import { hash } from '../helpers'

function generateUser(): MockUser {
  const firstName = faker.person.firstName()

  return {
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
