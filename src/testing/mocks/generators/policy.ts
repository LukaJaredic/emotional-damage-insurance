import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import { nanoid } from 'nanoid'

import type { Policy, PolicyHolder, PolicyLimits } from '@/types'
import { buildAuditFields, DEFAULT_AUDIT_USER_ID } from '@testing/mocks/audit'

function generatePolicyLimits(): PolicyLimits {
  return {
    insult: faker.number.int({ min: 1_000, max: 100_000 }),
    rejection: faker.number.int({ min: 1_000, max: 100_000 }),
    badJoke: faker.number.int({ min: 1_000, max: 100_000 }),
    gaslighting: faker.number.int({ min: 1_000, max: 100_000 }),
    overthinking: faker.number.int({ min: 1_000, max: 100_000 }),
    awkwardSilence: faker.number.int({ min: 1_000, max: 100_000 }),
    whyDontYouQuestion: faker.number.int({ min: 1_000, max: 100_000 }),
    meetingThatCouldHaveBeenEmail: faker.number.int({
      min: 1_000,
      max: 100_000,
    }),
  }
}

function generatePolicy(
  policyHolderId: PolicyHolder['id'],
  sequence: number,
): Policy {
  const startDate = faker.date.soon({ days: 30 })

  return {
    ...buildAuditFields(DEFAULT_AUDIT_USER_ID),
    id: nanoid(),
    policyHolderId,
    terminated: false,
    name: `${faker.company.name().slice(0, 2)}-${sequence + 1}`,
    premium: faker.number.int({ min: 50, max: 5_000 }),
    startDate,
    endDate: addDays(startDate, faker.number.int({ min: 30, max: 365 })),
    limits: generatePolicyLimits(),
  }
}

function generatePolicies(policyHolderIds: PolicyHolder['id'][]): Policy[] {
  return policyHolderIds.map((policyHolderId, index) =>
    generatePolicy(policyHolderId, index),
  )
}

export { generatePolicy, generatePolicies }
