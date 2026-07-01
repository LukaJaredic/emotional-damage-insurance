import { faker } from '@faker-js/faker'
import { nanoid } from 'nanoid'

import type { PolicyHolder } from '@/types'
import { buildAuditFields, DEFAULT_AUDIT_USER_ID } from '@testing/mocks/audit'

type GeneratedPolicyHolder = PolicyHolder & {
  firstName?: string
  lastName?: string
  businessName?: string
}

const generateGovernmentId = (length: number) => {
  return faker.string.numeric({ length, allowLeadingZeros: false })
}

function generateIndividualPolicyHolder(): GeneratedPolicyHolder {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  return {
    ...buildAuditFields(DEFAULT_AUDIT_USER_ID),
    id: nanoid(),
    type: 'individual',
    firstName,
    lastName,
    businessName: '',
    governmentId: generateGovernmentId(13),
    email: faker.internet.email({ firstName, lastName }),
    phone: faker.phone.number({ style: 'international' }),
  }
}

function generateBusinessPolicyHolder(): GeneratedPolicyHolder {
  const businessName = faker.company.name()

  return {
    ...buildAuditFields(DEFAULT_AUDIT_USER_ID),
    id: nanoid(),
    type: 'business',
    firstName: '',
    lastName: '',
    businessName,
    governmentId: generateGovernmentId(8),
    email: faker.internet.email({ firstName: businessName }),
    phone: faker.phone.number({ style: 'international' }),
  }
}

function generatePolicyHolder(): GeneratedPolicyHolder {
  return faker.helpers.arrayElement([
    generateIndividualPolicyHolder,
    generateBusinessPolicyHolder,
  ])()
}

function generatePolicyHolders(count: number): GeneratedPolicyHolder[] {
  return Array.from({ length: count }, generatePolicyHolder)
}

export { generatePolicyHolder, generatePolicyHolders }
