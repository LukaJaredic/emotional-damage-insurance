import { faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import { nanoid } from 'nanoid'

import type { Policy, PolicyHolder, PolicyLimits, PolicyStatus } from '@/types'
import { buildAuditFields, DEFAULT_AUDIT_USER_ID } from '@testing/mocks/audit'

type GeneratedPolicyStatus = Exclude<PolicyStatus, 'terminated'>

const generatedPolicyStatuses: GeneratedPolicyStatus[] = [
  'expired',
  'active',
  'future',
]

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
  status: GeneratedPolicyStatus,
  referenceDate: Date,
): Policy {
  const { startDate, endDate } = generatePolicyDates(status, referenceDate)

  return {
    ...buildAuditFields(DEFAULT_AUDIT_USER_ID),
    id: nanoid(),
    policyHolderId,
    terminated: false,
    name: `${faker.company.name().slice(0, 2)}-${sequence + 1}`,
    premium: faker.number.int({ min: 50, max: 5_000 }),
    startDate,
    endDate,
    limits: generatePolicyLimits(),
  }
}

function generatePolicyDates(
  status: GeneratedPolicyStatus,
  referenceDate: Date,
) {
  switch (status) {
    case 'expired':
      return {
        startDate: addDays(
          referenceDate,
          faker.number.int({ min: -365, max: -180 }),
        ),
        endDate: addDays(
          referenceDate,
          faker.number.int({ min: -179, max: -30 }),
        ),
      }
    case 'active':
      return {
        startDate: addDays(
          referenceDate,
          faker.number.int({ min: -180, max: -30 }),
        ),
        endDate: addDays(
          referenceDate,
          faker.number.int({ min: 30, max: 180 }),
        ),
      }
    case 'future':
      return {
        startDate: addDays(
          referenceDate,
          faker.number.int({ min: 30, max: 180 }),
        ),
        endDate: addDays(
          referenceDate,
          faker.number.int({ min: 181, max: 365 }),
        ),
      }
  }
}

function generatePolicies(policyHolderIds: PolicyHolder['id'][]): Policy[] {
  const referenceDate = new Date()

  return policyHolderIds.map((policyHolderId, index) =>
    generatePolicy(
      policyHolderId,
      index,
      generatedPolicyStatuses[index % generatedPolicyStatuses.length]!,
      referenceDate,
    ),
  )
}

export { generatePolicy, generatePolicies }
