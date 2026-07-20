import { HttpResponse } from 'msw'

import type { ApiErrorCode, ApiErrorResponse } from '@/types'

const defaultMessages = {
  INTERNAL_ERROR: 'Something went wrong on our side. Please try again.',
  // Authentication-related errors
  AUTHENTICATION_REQUIRED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  INVALID_CREDENTIALS: 'The email or password is incorrect.',
  // Policy-related errors
  POLICY_HOLDER_ALREADY_EXISTS:
    'A policy holder with this information already exists.',
  POLICY_HOLDER_NOT_FOUND:
    'We could not find that policy holder. It may have been removed.',
  // Policy-related errors
  POLICY_ALREADY_EXISTS: 'A policy with this information already exists.',
  POLICY_ALREADY_TERMINATED: 'This policy is already terminated.',
  POLICY_HAS_USERS: 'This policy cannot be deleted while users are assigned.',
  POLICY_INVALID_DATE_RANGE: 'The policy must last at least one day.',
  POLICY_NOT_FOUND: 'We could not find that policy. It may have been removed.',
  POLICY_NOT_TERMINATED: 'This policy is not terminated.',
  POLICY_USER_ALREADY_CONNECTED: 'This user is already assigned to the policy.',
  POLICY_USER_HAS_OVERLAPPING_POLICY:
    'This user is already assigned to a policy with overlapping current or future coverage.',
  POLICY_USER_NOT_CONNECTED: 'This user is not assigned to the policy.',
  // User-related errors
  USER_ALREADY_EXISTS: 'A user with this information already exists.',
  USER_NOT_FOUND: 'We could not find that user. It may have been removed.',
} satisfies Record<ApiErrorCode, string>

type MockApiErrorParams = {
  code: ApiErrorCode
  status: number
  message?: string
  fieldErrors?: Record<string, string[]>
}

export function mockApiError({
  code,
  status,
  message = defaultMessages[code],
  fieldErrors,
}: MockApiErrorParams) {
  const body: ApiErrorResponse = {
    error: {
      code,
      message,
      status,
      ...(fieldErrors ? { fieldErrors } : {}),
    },
  }

  return HttpResponse.json(body, { status })
}

export function mockInternalError() {
  return mockApiError({ code: 'INTERNAL_ERROR', status: 500 })
}
