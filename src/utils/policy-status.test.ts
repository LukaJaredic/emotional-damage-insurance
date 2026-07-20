import { addDays } from 'date-fns'

import type { Policy } from '@/types'

import { policyStatus } from './policy-status'

describe('policy status labels', () => {
  const tomorrow = addDays(new Date(), 1)
  const yesterday = addDays(new Date(), -1)

  it('should return "active" for active policies', () => {
    const policy = {
      terminated: false,
      startDate: yesterday,
      endDate: tomorrow,
    } as Policy

    expect(policyStatus(policy)).toBe('active')
  })

  it('should return "terminated" for terminated policies', () => {
    const policy = {
      terminated: true,
      startDate: yesterday,
      endDate: tomorrow,
    } as Policy

    expect(policyStatus(policy)).toBe('terminated')
  })

  it('should return "expired" for expired policies', () => {
    const policy = {
      terminated: false,
      startDate: addDays(yesterday, -10),
      endDate: yesterday,
    } as Policy

    expect(policyStatus(policy)).toBe('expired')
  })

  it('should return "future" for future policies', () => {
    const policy = {
      terminated: false,
      startDate: tomorrow,
      endDate: addDays(tomorrow, 10),
    } as Policy

    expect(policyStatus(policy)).toBe('future')
  })
})
